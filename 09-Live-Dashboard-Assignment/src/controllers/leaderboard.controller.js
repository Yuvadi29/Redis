import redis from '../config/redis.js'

const LEADERBOARD_KEY = 'global:leaderboard'

export const addScore = async (req, res) => {
  try {
    const { userId, points } = req.body

    if (!userId || !points) {
      return res.status(400).json({
        success: false,
        message: 'userId and points required'
      })
    }

    const updatedScore = await redis.zincrby(LEADERBOARD_KEY, points, userId)
    return res.json({
      success: true,
      userId,
      updatedScore
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error
    })
  }
}

export const getLeaderboard = async (req, res) => {
  try {
    const leaders = await redis.zrevrange(LEADERBOARD_KEY, 0, 9, 'WITHSCORES')

    const formatted = []

    for (let i = 0; i < leaders.length; i += 2) {
      formatted.push({
        userId: leaders[i],
        score: Number(leaders[i + 1])
      })
    }

    return res.json({
      success: true,
      leaderboard: formatted
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error
    })
  }
}

export const getUserRank = async (req, res) => {
  try {
    const { userId } = req.params

    const rank = await redis.zrevrank(LEADERBOARD_KEY, userId)

    if (rank === null) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    return res.json({
      success: true,
      userId,
      rank: rank + 1
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error
    })
  }
}
