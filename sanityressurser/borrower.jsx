const borrower = {
  name: 'borrower',
  title: 'Borrower',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'email',
      title: 'Email',
      type: 'string'
    }
  ]
}

export default borrower