// Generate a draw ticket (5 numbers from 1–45 in Stableford range)
export const generateNumbers = (count = 5, min = 1, max = 45) => {
  const nums = new Set()
  while (nums.size < count) {
    nums.add(Math.floor(Math.random() * (max - min + 1)) + min)
  }
  return [...nums].sort((a, b) => a - b)
}

// Algorithmic draw: weight by score frequency across all participants
export const algorithmicDraw = (allScores) => {
  if (!allScores || allScores.length === 0) return generateNumbers()

  // Build frequency map
  const freq = {}
  allScores.forEach(s => {
    freq[s] = (freq[s] || 0) + 1
  })

  // Weighted sampling — higher frequency = more likely to appear in draw
  const pool = []
  Object.entries(freq).forEach(([num, count]) => {
    for (let i = 0; i < count; i++) {
      pool.push(parseInt(num))
    }
  })

  const selected = new Set()
  let attempts = 0
  while (selected.size < 5 && attempts < 1000) {
    const idx = Math.floor(Math.random() * pool.length)
    selected.add(pool[idx])
    attempts++
  }

  // Top up with randoms if needed
  while (selected.size < 5) {
    selected.add(Math.floor(Math.random() * 45) + 1)
  }

  return [...selected].sort((a, b) => a - b)
}

// Check how many numbers a user's scores match with draw numbers
export const checkMatch = (userScores, drawNumbers) => {
  const userSet = new Set(userScores)
  const matched = drawNumbers.filter(n => userSet.has(n))
  return matched.length
}

// Prize pool calculation
export const calculatePrizePool = (subscriberCount, monthlyFee = 9.99) => {
  const totalPool = subscriberCount * monthlyFee * 0.6 // 60% to prize pool
  return {
    total: totalPool,
    fiveMatch: totalPool * 0.40,  
    fourMatch: totalPool * 0.35,  
    threeMatch: totalPool * 0.25, 
  }
}

// Determine match tier label
export const getMatchTier = (matchCount) => {
  if (matchCount === 5) return { tier: '5-Match Jackpot', key: 'fiveMatch', emoji: '🏆' }
  if (matchCount === 4) return { tier: '4-Number Match', key: 'fourMatch', emoji: '🥇' }
  if (matchCount === 3) return { tier: '3-Number Match', key: 'threeMatch', emoji: '🥈' }
  return null
}

// Run a full simulation draw
export const runSimulation = (participants, drawType = 'random', jackpotCarriedOver = 0) => {
  const allScores = participants.flatMap(p => p.scores || [])
  const drawNumbers = drawType === 'algorithm'
    ? algorithmicDraw(allScores)
    : generateNumbers()

  const subscriberCount = participants.length
  const pool = calculatePrizePool(subscriberCount)
  pool.fiveMatch += jackpotCarriedOver

  const winners = { fiveMatch: [], fourMatch: [], threeMatch: [] }

  participants.forEach(p => {
    const matchCount = checkMatch(p.scores || [], drawNumbers)
    const tier = getMatchTier(matchCount)
    if (tier) {
      winners[tier.key].push({ ...p, matchCount, tier: tier.tier })
    }
  })

  // Split prizes among winners in same tier
  const prizes = {}
  Object.entries(winners).forEach(([key, w]) => {
    prizes[key] = w.length > 0 ? pool[key] / w.length : 0
  })

  const jackpotRolledOver = winners.fiveMatch.length === 0 ? pool.fiveMatch : 0

  return {
    drawNumbers,
    drawType,
    pool,
    winners,
    prizes,
    jackpotRolledOver,
    participantCount: participants.length,
    timestamp: new Date().toISOString(),
  }
}
