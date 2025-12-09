#!/usr/bin/env node
/**
 * Test script to verify data is saved correctly
 * Usage: node test_fix.js
 */

const fs = require('fs');
const path = require('path');

// Directory with conversation files
const DATA_DIR = path.join(__dirname, 'data', 'conversations');

function checkLatestConversation() {
  console.log('Checking latest conversation files...\n');

  if (!fs.existsSync(DATA_DIR)) {
    console.log('❌ No conversations directory found');
    return;
  }

  // Get all JSON files
  const files = fs.readdirSync(DATA_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const filePath = path.join(DATA_DIR, f);
      const stats = fs.statSync(filePath);
      return { filePath, mtime: stats.mtime };
    })
    .sort((a, b) => b.mtime - a.mtime);

  if (files.length === 0) {
    console.log('❌ No conversation files found');
    return;
  }

  const latest = files[0];
  const data = JSON.parse(fs.readFileSync(latest.filePath, 'utf8'));

  console.log(`Latest: ${path.basename(latest.filePath)}`);
  console.log(`Title: ${data.title}`);
  console.log(`Messages: ${data.messages.length}`);
  console.log('');

  let hasAssistant = false;
  let hasStages = { stage1: false, stage2: false, stage3: false };

  data.messages.forEach((msg, idx) => {
    console.log(`Message ${idx + 1}:`);
    console.log(`  Role: ${msg.role}`);

    if (msg.role === 'user') {
      const content = msg.content || '';
      console.log(`  Content: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`);
    } else if (msg.role === 'assistant') {
      hasAssistant = true;
      hasStages.stage1 = msg.stage1 && msg.stage1.length > 0;
      hasStages.stage2 = msg.stage2 && msg.stage2.length > 0;
      hasStages.stage3 = msg.stage3 && msg.stage3.response;

      console.log(`  Stage 1: ${hasStages.stage1 ? `✅ ${msg.stage1.length} responses` : '❌ none'}`);
      console.log(`  Stage 2: ${hasStages.stage2 ? `✅ ${msg.stage2.length} rankings` : '❌ none'}`);
      console.log(`  Stage 3: ${hasStages.stage3 ? `✅ ${msg.stage3.model}` : '❌ none'}`);
    }
  });

  console.log('\n' + '='.repeat(50));
  if (hasAssistant) {
    console.log('✅ Assistant message FOUND');
    if (hasStages.stage1 && hasStages.stage2 && hasStages.stage3) {
      console.log('✅ ALL three stages saved successfully');
    } else {
      console.log('⚠️  Only partial stages saved (may be expected if errors occurred)');
    }
  } else {
    console.log('❌ No assistant message found');
    console.log('   This means data was not saved during the last run');
    console.log('   Check backend.log for errors');
  }
}

// Watch mode
if (process.argv.includes('--watch')) {
  console.log('Watching for changes... Press Ctrl+C to exit\n');
  checkLatestConversation();

  fs.watch(DATA_DIR, (eventType, filename) => {
    if (filename && filename.endsWith('.json')) {
      console.log(`\n[${new Date().toLocaleTimeString()}] File changed: ${filename}`);
      setTimeout(checkLatestConversation, 1000); // wait for file to be written
    }
  });
} else {
  checkLatestConversation();
}
