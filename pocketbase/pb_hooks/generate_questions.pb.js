routerAdd("POST", "/api/custom/generate-questions", (c) => {
  const info = $apis.requestInfo(c)
  if (!info.authRecord) {
    return c.json(401, { error: "Unauthorized" })
  }

  const body = info.data
  const topic = body.topic || ""
  const count = parseInt(body.count) || 10

  if (!topic) {
    return c.json(400, { error: "topic is required" })
  }

  let apiKey = ""
  let model = "claude-haiku-4-5-20251001"
  try {
    const records = $app.dao().findRecordsByFilter("settings", "id != ''", "-created", 1, 0)
    if (records.length > 0) {
      apiKey = records[0].getString("ai_api_key")
      const m = records[0].getString("ai_model")
      if (m) model = m
    }
  } catch (e) {}

  if (!apiKey) {
    return c.json(400, { error: "AI API key not configured. Set it in Admin → Settings." })
  }

  const prompt = `Generate ${count} trivia questions about "${topic}". Return ONLY a JSON array with no other text, like:\n[{"question":"...", "answer":"...", "difficulty":"easy|medium|hard"}]\nMake questions specific, factual, and at varied difficulty levels.`

  const resp = $http.send({
    url: "https://api.anthropic.com/v1/messages",
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    }),
    timeout: 30,
  })

  if (resp.statusCode !== 200) {
    return c.json(502, { error: "AI API error: " + resp.raw })
  }

  try {
    const content = resp.json.content[0].text
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error("No JSON array in response")
    const questions = JSON.parse(jsonMatch[0])
    return c.json(200, { questions })
  } catch (e) {
    return c.json(502, { error: "Failed to parse AI response: " + e.message })
  }
})
