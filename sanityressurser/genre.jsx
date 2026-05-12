const genre = {
  name: 'genre',
  title: 'Genre',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    }
  ]
}

export default genre
