const documents = [
    // Add your documents here as strings
    "Document 1 content...",
    "Document 2 content...",
];

function findMostRelevantDocument(question) {
    // Simple matching for demo purposes. Implement a more advanced algorithm if needed.
    for (let doc of documents) {
        if (doc.includes(question)) {
            return doc;
        }
    }
    return documents.length > 0 ? documents[0] : "No relevant document found.";
}

async function handleUserQuestion(question) {
    const apiKey = document.getElementById('apiKey').value;
    if (!apiKey) {
        alert("Please enter your OpenAI API key.");
        return;
    }

    const relevantDocument = findMostRelevantDocument(question);

    const requestBody = {
        model: "gpt-4o",
        prompt: `User asked: ${question}\nDocument says: ${relevantDocument}\nAnswer:`,
        max_tokens: 150
    };

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API request failed: ${errorText}`);
        }

        const data = await response.json();
        document.getElementById('answerText').innerText = data.choices[0].text;
    } catch (error) {
        console.error("Error:", error);
        document.getElementById('answerText').innerText = `Error: ${error.message}`;
    }
}

function submitQuestion() {
    const question = document.getElementById('userQuestion').value;
    handleUserQuestion(question);
}
