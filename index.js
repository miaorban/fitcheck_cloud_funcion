async function generateResponse(quizId) {
  return '123';
}

app.get('/', async (req, res) => {
  const quizId = req.query.quizId;
  const response = await generateResponse(quizId);
  res.send(response);
});

const port = parseInt(process.env.PORT) || 8080;
app.listen(port, () => {
  console.log(`helloworld: listening on port ${port}`);
});