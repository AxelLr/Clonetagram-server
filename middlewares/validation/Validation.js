module.exports = (schema) => { 
  return (req, res, next) => { 
    console.log(req.body)
  const { error } = schema.validate(req.body, { abortEarly: false })
  if (!error) { 
    next()
  } else { 
      
    const { details } = error
    const message = details.map(i => i.message).join(',')

    console.log("error", message) 
   res.status(422).json({ error: message }) } 
  } 
} 
