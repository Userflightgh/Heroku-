const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { exec } = require('youtube-dl-exec');
const ffmpeg = require('fluent-ffmpeg');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/cut-video', async (req, res) => {
    const { videoUrl, startTime, endTime } = req.body;

    if (!videoUrl || !startTime || !endTime) {
        return res.status(400).json({ success: false, message: 'Invalid input' });
    }

    try {
        const outputDir = path.join(__dirname, 'downloads');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        const videoPath = path.join(outputDir, 'video.mp4');
        const outputPath = path.join(outputDir, `cut-video-${Date.now()}.mp4`);

        await exec(videoUrl, {
            output: videoPath
        });

        ffmpeg(videoPath)
            .setStartTime(startTime)
            .setDuration(endTime - startTime)
            .output(outputPath)
            .on('end', () => {
                res.json({ success: true, message: 'Video cut successfully', path: outputPath });
            })
            .on('error', err => {
                console.error('Error cutting video:', err);
                res.status(500).json({ success: false, message: 'Failed to cut video' });
            })
            .run();
    } catch (error) {
        console.error('Error processing video:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
