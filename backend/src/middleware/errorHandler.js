const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  if (err.message === 'Unauthenticated') {
    return res.status(401).json({ error: 'Unauthenticated' });
  }

  res.status(500).json({ error: 'Something went wrong!' });
};

module.exports = { errorHandler };
