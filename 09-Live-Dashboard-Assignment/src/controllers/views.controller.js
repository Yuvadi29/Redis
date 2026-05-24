import redis from '../config/redis.js'

export const incrementPostViews = async (req, res) => {
  try {
    const { id } = req.params
    const views = await redis.incr(`post:${id}:views`)
    return res.json({
      success: true,
      postId: id,
      views
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error
    })
  }
}
