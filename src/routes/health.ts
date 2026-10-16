import express from 'express'

const health_router = express.Router();


health_router.get("/", (req, res) => {
    res.status(200).json({
      status:"UP",
      uptime : process.uptime(),
      timestamp: new Date().toISOString() 
    })
})

export default health_router
