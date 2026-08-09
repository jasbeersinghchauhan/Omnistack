function getHealth(req, res) {
    res.status(200).json({
        success: true,
        message: "OmniStock API is running",
        timestamp: new Date().toISOString(),
    });
}

export default getHealth;
