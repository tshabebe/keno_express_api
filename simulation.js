// Keno House Profit Simulation
// Simulates thousands of users with different bet sizes and number selections

const PAYTABLE = {
  1: { 1: 3 },
  2: { 1: 1, 2: 9 },
  3: { 1: 1, 2: 2, 3: 16 },
  4: { 1: 0, 2: 2, 3: 6, 4: 12 },
  5: { 1: 0, 2: 1, 3: 3, 4: 15, 5: 50 },
  6: { 1: 0, 2: 0, 3: 2, 4: 3, 5: 30, 6: 75 },
  7: { 1: 0, 2: 0, 3: 1, 4: 6, 5: 12, 6: 36, 7: 100 },
  8: { 1: 0, 2: 0, 3: 1, 4: 3, 5: 6, 6: 19, 7: 90, 8: 720 },
  9: { 1: 0, 2: 0, 3: 1, 4: 2, 5: 4, 6: 8, 7: 20, 8: 80, 9: 1200 },
  10: { 1: 0, 2: 0, 3: 1, 4: 2, 5: 3, 6: 8, 7: 26, 8: 500, 9: 1500, 10: 10000 },
};

// Generate a random Keno draw (20 unique numbers from 1-80)
function generateDraw() {
  const numbers = [];
  const available = Array.from({ length: 80 }, (_, i) => i + 1);
  
  for (let i = 0; i < 20; i++) {
    const idx = Math.floor(Math.random() * available.length);
    numbers.push(available[idx]);
    available.splice(idx, 1);
  }
  
  return numbers;
}

// Generate random player picks
function generatePlayerPicks(count) {
  const picks = [];
  const available = Array.from({ length: 80 }, (_, i) => i + 1);
  
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * available.length);
    picks.push(available[idx]);
    available.splice(idx, 1);
  }
  
  return picks.sort((a, b) => a - b);
}

// Count matches between player picks and drawn numbers
function countMatches(picks, drawn) {
  const drawnSet = new Set(drawn);
  return picks.filter(n => drawnSet.has(n)).length;
}

// Calculate payout for a ticket
function calculatePayout(picks, drawn, betAmount) {
  const numPicks = picks.length;
  const matches = countMatches(picks, drawn);
  const payoutTable = PAYTABLE[numPicks] || {};
  const multiplier = payoutTable[matches] || 0;
  return betAmount * multiplier;
}

// Generate random bet amount (weighted towards smaller bets)
function generateBetAmount() {
  const rand = Math.random();
  if (rand < 0.4) return 1;      // 40% bet 1 ETB
  if (rand < 0.65) return 2;     // 25% bet 2 ETB
  if (rand < 0.8) return 5;      // 15% bet 5 ETB
  if (rand < 0.9) return 10;     // 10% bet 10 ETB
  if (rand < 0.95) return 20;    // 5% bet 20 ETB
  if (rand < 0.98) return 50;    // 3% bet 50 ETB
  return 100;                     // 2% bet 100 ETB
}

// Generate random number of picks (weighted towards middle values)
function generatePickCount() {
  const rand = Math.random();
  if (rand < 0.05) return 1;     // 5%
  if (rand < 0.10) return 2;     // 5%
  if (rand < 0.20) return 3;     // 10%
  if (rand < 0.30) return 4;     // 10%
  if (rand < 0.45) return 5;     // 15%
  if (rand < 0.60) return 6;     // 15%
  if (rand < 0.75) return 7;     // 15%
  if (rand < 0.85) return 8;     // 10%
  if (rand < 0.93) return 9;     // 8%
  return 10;                      // 7%
}

// Main simulation function
function runSimulation(numUsers = 10000, numRounds = 100, verbose = true) {
  let totalWagered = 0;
  let totalPaidOut = 0;
  let totalTickets = 0;
  let totalWins = 0;
  
  const pickCountStats = {};
  const betAmountStats = {};
  const winsByPicks = {};
  
  // Initialize stats
  for (let i = 1; i <= 10; i++) {
    pickCountStats[i] = { wagered: 0, paid: 0, tickets: 0, wins: 0 };
    winsByPicks[i] = {};
  }
  
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🎲 KENO SIMULATION - ${numUsers.toLocaleString()} Users × ${numRounds} Rounds`);
  console.log(`${'='.repeat(70)}\n`);
  
  if (verbose) {
    console.log('Running simulation...\n');
  }
  
  for (let round = 1; round <= numRounds; round++) {
    const drawn = generateDraw();
    
    if (verbose && round % 10 === 0) {
      process.stdout.write(`\rProgress: ${round}/${numRounds} rounds (${((round/numRounds)*100).toFixed(0)}%)`);
    }
    
    // Simulate random number of users per round (80-120% of numUsers)
    const usersThisRound = Math.floor(numUsers * (0.8 + Math.random() * 0.4));
    
    for (let user = 0; user < usersThisRound; user++) {
      const pickCount = generatePickCount();
      const betAmount = generateBetAmount();
      const picks = generatePlayerPicks(pickCount);
      const payout = calculatePayout(picks, drawn, betAmount);
      
      totalWagered += betAmount;
      totalPaidOut += payout;
      totalTickets++;
      
      if (payout > 0) {
        totalWins++;
        pickCountStats[pickCount].wins++;
        const matches = countMatches(picks, drawn);
        winsByPicks[pickCount][matches] = (winsByPicks[pickCount][matches] || 0) + 1;
      }
      
      pickCountStats[pickCount].wagered += betAmount;
      pickCountStats[pickCount].paid += payout;
      pickCountStats[pickCount].tickets++;
      
      betAmountStats[betAmount] = betAmountStats[betAmount] || { wagered: 0, paid: 0, tickets: 0 };
      betAmountStats[betAmount].wagered += betAmount;
      betAmountStats[betAmount].paid += payout;
      betAmountStats[betAmount].tickets++;
    }
  }
  
  if (verbose) {
    console.log('\n');
  }
  
  const houseProfit = totalWagered - totalPaidOut;
  const houseEdge = (houseProfit / totalWagered) * 100;
  const rtp = (totalPaidOut / totalWagered) * 100;
  const winRate = (totalWins / totalTickets) * 100;
  
  // Print overall results
  console.log('\n' + '─'.repeat(70));
  console.log('📊 OVERALL RESULTS');
  console.log('─'.repeat(70));
  console.log(`Total Tickets Sold:     ${totalTickets.toLocaleString()}`);
  console.log(`Total Wagered:          ${totalWagered.toLocaleString()} ETB`);
  console.log(`Total Paid Out:         ${totalPaidOut.toLocaleString()} ETB`);
  console.log(`House Profit:           ${houseProfit.toLocaleString()} ETB`);
  console.log(`House Edge:             ${houseEdge.toFixed(2)}%`);
  console.log(`RTP (Return to Player): ${rtp.toFixed(2)}%`);
  console.log(`Win Rate:               ${winRate.toFixed(2)}% of tickets won something`);
  console.log(`Average Bet:            ${(totalWagered / totalTickets).toFixed(2)} ETB`);
  console.log(`Average Payout:         ${(totalPaidOut / totalTickets).toFixed(2)} ETB`);
  
  // Print results by pick count
  console.log('\n' + '─'.repeat(70));
  console.log('📈 RESULTS BY NUMBER OF PICKS');
  console.log('─'.repeat(70));
  console.log('Picks | Tickets | Wagered (ETB) | Paid Out (ETB) | Profit (ETB) | Edge % | Win Rate');
  console.log('─'.repeat(70));
  
  for (let i = 1; i <= 10; i++) {
    const stats = pickCountStats[i];
    if (stats.tickets === 0) continue;
    
    const profit = stats.wagered - stats.paid;
    const edge = (profit / stats.wagered) * 100;
    const pickWinRate = (stats.wins / stats.tickets) * 100;
    
    console.log(
      `${i.toString().padStart(5)} | ` +
      `${stats.tickets.toLocaleString().padStart(7)} | ` +
      `${stats.wagered.toLocaleString().padStart(13)} | ` +
      `${stats.paid.toLocaleString().padStart(14)} | ` +
      `${profit.toLocaleString().padStart(12)} | ` +
      `${edge.toFixed(2).padStart(6)} | ` +
      `${pickWinRate.toFixed(2).padStart(8)}%`
    );
  }
  
  // Print win distribution by pick count
  console.log('\n' + '─'.repeat(70));
  console.log('🎯 WIN DISTRIBUTION (Number of Matches)');
  console.log('─'.repeat(70));
  
  for (let picks = 1; picks <= 10; picks++) {
    if (pickCountStats[picks].tickets === 0) continue;
    
    const matchCounts = winsByPicks[picks];
    const totalForPicks = pickCountStats[picks].tickets;
    
    console.log(`\n${picks} Picks (${totalForPicks.toLocaleString()} tickets):`);
    
    const sortedMatches = Object.keys(matchCounts)
      .map(Number)
      .sort((a, b) => a - b);
    
    for (const matches of sortedMatches) {
      const count = matchCounts[matches];
      const percentage = (count / totalForPicks) * 100;
      const multiplier = PAYTABLE[picks]?.[matches] || 0;
      const bar = '█'.repeat(Math.floor(percentage / 2));
      
      console.log(
        `  ${matches} matches: ${count.toLocaleString().padStart(6)} (${percentage.toFixed(2).padStart(5)}%) ${multiplier}x ${bar}`
      );
    }
  }
  
  // Print results by bet amount
  console.log('\n' + '─'.repeat(70));
  console.log('💰 RESULTS BY BET AMOUNT');
  console.log('─'.repeat(70));
  console.log('Bet (ETB) | Tickets | Wagered (ETB) | Paid Out (ETB) | Profit (ETB) | Edge %');
  console.log('─'.repeat(70));
  
  const sortedBets = Object.keys(betAmountStats)
    .map(Number)
    .sort((a, b) => a - b);
  
  for (const bet of sortedBets) {
    const stats = betAmountStats[bet];
    if (!stats || stats.tickets === 0) continue;
    
    const profit = stats.wagered - stats.paid;
    const edge = (profit / stats.wagered) * 100;
    
    console.log(
      `${bet.toString().padStart(9)} | ` +
      `${stats.tickets.toLocaleString().padStart(7)} | ` +
      `${stats.wagered.toLocaleString().padStart(13)} | ` +
      `${stats.paid.toLocaleString().padStart(14)} | ` +
      `${profit.toLocaleString().padStart(12)} | ` +
      `${edge.toFixed(2).padStart(6)}`
    );
  }
  
  console.log('\n' + '='.repeat(70) + '\n');
  
  return {
    totalWagered,
    totalPaidOut,
    houseProfit,
    houseEdge,
    rtp,
    totalTickets,
    totalWins,
    winRate,
    pickCountStats,
    betAmountStats
  };
}

// Run multiple simulations for statistical confidence
function runMultipleSimulations(numSimulations = 5, usersPerSim = 10000, roundsPerSim = 100) {
  console.log('\n' + '═'.repeat(70));
  console.log('🔬 RUNNING MULTIPLE SIMULATIONS FOR STATISTICAL CONFIDENCE');
  console.log('═'.repeat(70));
  
  const results = [];
  
  for (let i = 1; i <= numSimulations; i++) {
    console.log(`\n${'─'.repeat(70)}`);
    console.log(`Simulation ${i} of ${numSimulations}`);
    console.log('─'.repeat(70));
    
    const result = runSimulation(usersPerSim, roundsPerSim, i === 1);
    results.push(result);
  }
  
  // Calculate averages
  const avgHouseEdge = results.reduce((sum, r) => sum + r.houseEdge, 0) / numSimulations;
  const avgRTP = results.reduce((sum, r) => sum + r.rtp, 0) / numSimulations;
  const avgWinRate = results.reduce((sum, r) => sum + r.winRate, 0) / numSimulations;
  
  const minHouseEdge = Math.min(...results.map(r => r.houseEdge));
  const maxHouseEdge = Math.max(...results.map(r => r.houseEdge));
  
  console.log('\n' + '═'.repeat(70));
  console.log('📊 SUMMARY ACROSS ALL SIMULATIONS');
  console.log('═'.repeat(70));
  console.log(`Number of Simulations:  ${numSimulations}`);
  console.log(`Total Users Simulated:  ${(usersPerSim * roundsPerSim * numSimulations).toLocaleString()}`);
  console.log('');
  console.log(`Average House Edge:     ${avgHouseEdge.toFixed(2)}%`);
  console.log(`House Edge Range:       ${minHouseEdge.toFixed(2)}% - ${maxHouseEdge.toFixed(2)}%`);
  console.log(`Average RTP:            ${avgRTP.toFixed(2)}%`);
  console.log(`Average Win Rate:       ${avgWinRate.toFixed(2)}%`);
  console.log('═'.repeat(70) + '\n');
  
  return results;
}

// Parse command line arguments
const args = process.argv.slice(2);
const mode = args[0] || 'single';

if (mode === 'multiple' || mode === 'multi') {
  const numSims = parseInt(args[1]) || 5;
  const users = parseInt(args[2]) || 10000;
  const rounds = parseInt(args[3]) || 100;
  runMultipleSimulations(numSims, users, rounds);
} else {
  const users = parseInt(args[1]) || 10000;
  const rounds = parseInt(args[2]) || 100;
  runSimulation(users, rounds, true);
}

