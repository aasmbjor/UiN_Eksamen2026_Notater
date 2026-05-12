export default {
  name: 'order',
  title: 'Order',
  type: 'document',
  fields: [
    {
      name: 'borrower',
      title: 'Borrower',
      type: 'reference',
      to: [{ type: 'borrower' }],
      validation: Rule => Rule.required()
    },
    {
      name: 'books',
      title: 'Books',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'book' }]
        }
      ],
      validation: Rule => Rule.min(1)
    },
    {
      name: 'orderDate',
      title: 'Order Date',
      type: 'datetime',
      validation: Rule => Rule.required()
    }
  ],
  preview: {
  select: {
    borrower: "borrower.name",
    books: "books"
  },
  prepare({ borrower, books }) {
    return {
      title: `Order by ${borrower ?? "Unknown"}`,
      subtitle: `${books?.length || 0} books`
    };
  }
}

}
