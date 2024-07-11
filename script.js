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

async function queryOpenAI(question, key) {
    const relevantDocument = findMostRelevantDocument(question);
    const prompt = `User asked: ${question}\nDocument says: ${relevantDocument}\nAnswer:`;

    const requestBody = {
        model: "text-davinci-003",  // or "gpt-4" if available
        prompt: prompt,
        max_tokens: 150
    };

    const response = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    return data.choices[0].text;
}

// Example usage: Call this function when the user submits a question
async function handleUserQuestion(question, key) {
    const answer = await queryOpenAI(question, key);
    document.getElementById('answerText').innerText = answer; // Display the answer in the VR environment
}

function submitQuestion() {
    const openAIKey = document.getElementById('key').value;
    const question = document.getElementById('userQuestion').value;
    handleUserQuestion(question, openAIKey);
}
