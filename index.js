app.post('/generate-question', async (req, res) => {
    const { category } = req.body;
  
    try {
      const prompt = category && category !== "Mixta"
        ? `Genera 5 preguntas de trivia sobre el tema "${category}". Devuelve cada una con su respuesta, en formato:\nPregunta: ...\nRespuesta: ...`
        : `Genera 5 preguntas de trivia variadas de diferentes categorías. Formato:\nPregunta: ...\nRespuesta: ...`;
  
      const completion = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [{ role: "user", content: prompt }]
      });
  
      const content = completion.data.choices[0].message.content;
  
      const rawPairs = content.split(/Pregunta:/g).slice(1); // elimina vacío inicial
      const parsedQuestions = rawPairs.map(pair => {
        const [q, a] = pair.split("Respuesta:");
        return {
          question: q.trim(),
          answer: a ? a.trim() : "No disponible"
        };
      });
  
      // Guarda en MongoDB si deseas
      for (let item of parsedQuestions) {
        await new Question(item).save();
      }
  
      res.json({ questions: parsedQuestions });
    } catch (err) {
      console.error('❌ Error generando preguntas:', err);
      res.status(500).json({ error: 'Error generando preguntas' });
    }
  });
  