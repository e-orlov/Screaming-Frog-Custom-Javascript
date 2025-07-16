function calculateImageEmbeddings() {
    return new Promise(async (resolve, reject) => {
        try {
            // Load TensorFlow.js
            await new Promise((res, rej) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.11.0';
                script.onload = res;
                script.onerror = rej;
                document.head.appendChild(script);
            });

            // Load MobileNet model
            await new Promise((res, rej) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.0';
                script.onload = res;
                script.onerror = rej;
                document.head.appendChild(script);
            });

            // Ensure TensorFlow.js is ready
            await tf.ready();

            const img = document.querySelector('img');
            if (!img) {
                throw new Error('No image found on the page');
            }

            await new Promise((res) => {
                if (img.complete) res();
                else img.onload = res;
            });

            const model = await mobilenet.load();
            const tensor = tf.browser.fromPixels(img)
                .resizeBilinear([224, 224])
                .toFloat()
                .div(tf.scalar(127.5))
                .sub(tf.scalar(1))
                .expandDims(0);

            const embeddings = model.infer(tensor, true);

            // Normalize embeddings to avoid zeros
            const normalizedEmbeddings = tf.tidy(() => {
                const mean = tf.mean(embeddings);
                const std = tf.moments(embeddings).variance.sqrt();
                return embeddings.sub(mean).div(std);
            });

            resolve(Array.from(normalizedEmbeddings.dataSync()).toString());
        } catch (error) {
            reject(error);
        }
    });
}

return calculateImageEmbeddings()
    .then(embeddings => seoSpider.data(embeddings))
    .catch(error => seoSpider.error(error.toString()));
