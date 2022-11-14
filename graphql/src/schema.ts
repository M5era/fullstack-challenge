import {
  intArg,
  makeSchema,
  nonNull,
  objectType,
  stringArg,
  inputObjectType,
  arg,
  asNexusMethod,
  enumType,
  list,
  extendType,
} from 'nexus'
import { DateTimeResolver } from 'graphql-scalars'
import { Context } from './context'
import { Prisma } from "@prisma/client"
export const DateTime = asNexusMethod(DateTimeResolver, 'date')

const Query = objectType({
  name: 'Query',
  definition(t) {



    t.nonNull.list.nonNull.field('allCategories', {
      type: 'Category',
      args: {
        skip: intArg(),   // 1
        take: intArg(),   // 1
      },
      resolve: (_parent, args, context: Context) => {
        return context.prisma.category.findMany({
          skip: args?.skip as number | undefined,    // 2
          take: args?.take as number | undefined,    // 2
        })
      },
    })

    t.nonNull.list.nonNull.field('allAccounts', {
      type: 'Account',
      args: {
        skip: intArg(),   // 1
        take: intArg(),   // 1
      },
      resolve: (_parent, args, context: Context) => {
        return context.prisma.account.findMany({
          skip: args?.skip as number | undefined,    // 2
          take: args?.take as number | undefined,    // 2
        })
      },
    })


    t.nonNull.list.nonNull.field('allTransactions', {
      type: 'Transaction',
      args: {
        searchAll: stringArg(),
        skip: intArg(),   // 1
        take: intArg(),   // 1
        orderBy: arg({ type: list(nonNull(TransactionOrderByInput)) }),  // 1
      },
      resolve: (_parent, args, context: Context) => {
        const where = args.searchAll
            ? {
              OR: [
                { account: { contains: args.searchAll } },
                { reference: { contains: args.searchAll } },
                { category: { contains: args.searchAll } },
              ],
            }
            : {};
        return context.prisma.transaction.findMany({
          where,
          skip: args?.skip as number | undefined,    // 2
          take: args?.take as number | undefined,    // 2
          orderBy: args?.orderBy as Prisma.Enumerable<Prisma.TransactionOrderByWithRelationInput> | undefined,  // 2
        })
      },
    })



    t.field('transactionsWithPagination', {
          type: 'Response',
          args: {
            first: intArg(),
            after: stringArg(),
          },
          async resolve(_, args, context: Context) {
            let queryResults = null
            let first = 15 // default page length
            if (args.first != null){
              first = args.first
            }

            if (args.after) {
              // check if there is a cursor as the argument
              queryResults = await context.prisma.transaction.findMany({
                take: first, // the number of items to return from the database
                skip: 1, // skip the cursor
                cursor: {
                  id: args.after, // the cursor
                },
                orderBy: {
                  date: 'desc',
                },
              })
            } else {
              // if no cursor, this means that this is the first request
              //  and we will return the first items in the database
              queryResults = await context.prisma.transaction.findMany({
                take: first,
                orderBy: {
                  date: 'desc',
                },
              })
            }
            // if the initial request returns links
            if (queryResults.length > 0) {
              // get last element in previous result set
              const lastTransactionInResults = queryResults[queryResults.length - 1]
              // cursor we'll return in subsequent requests
              const myCursor = lastTransactionInResults.id
              // query after the cursor to check if we have nextPage
              const secondQueryResults = await context.prisma.transaction.findMany({
                take: first,
                cursor: {
                  id: myCursor,
                },
                orderBy: {
                  date: 'desc',
                },
              })
              // return response

              const result = {
                pageInfo: {
                  endCursor: myCursor,
                  hasNextPage: secondQueryResults.length >= first, //if the number of items requested is greater than the response of the second query, we have another page
                },
                edges: queryResults.map(transaction => ({
                  cursor: transaction.id,
                  node: transaction,
                })),
              }
              return result
            }
            //
            return {
              pageInfo: {
                endCursor: null,
                hasNextPage: false,
              },
              edges: [],
            }
          },
        })


  },
})
const Mutation = objectType({
  name: 'Mutation',
  definition(t) {
    t.field('updateTransactionCategory', {
      type: 'Transaction',
      args: {
        id: nonNull(stringArg()),
        category: stringArg(),
        categoryId: stringArg(),
      },
      resolve: (_, args, context: Context) => {
        return context.prisma.transaction.update({
          where: { id: args.id || undefined },
          data: {
            category: args.category,
            categoryId: args.categoryId,
          },
        })
      },
    })

    t.field('createCategory', {
      type: 'Category',
      args: {
        name: nonNull(stringArg()),
        color: stringArg(),
      },
      resolve: (_, args, context: Context) => {
        let primary_key = args.name;
        let dateTime = new Date()
        let serialized_id = Buffer.from(primary_key+':'+dateTime).toString('base64');

        return context.prisma.category.create({
          data: {
            id: serialized_id,
            color: args.color,
            name: args.name,
          }
        })
      }
    })
  }
})


const Account = objectType({
  name: 'Account',
  definition(t) {
    t.nonNull.string('id')
    t.string('name')
    t.string('bank')
  },
})

const Transaction = objectType({
  name: 'Transaction',
  definition(t) {
    t.nonNull.string('id')
    t.string('category')
    t.string('reference')
    t.string('amount')
    t.string('currency')
    t.date('date')
    t.string('account')
    t.string('bank')
    t.string('accountId')
    t.string('categoryId')
  },
})

const Category = objectType({
  name: 'Category',
  definition(t) {
    t.nonNull.string('id')
    t.string('color')
    t.string('name')
  },
})

const Edge = objectType({
  name: 'Edge',
  definition(t) {
    t.string('cursor')
    t.field('node', {type: Transaction})
  },
})
const PageInfo = objectType({
  name: 'PageInfo',
  definition(t) {
    t.string('endCursor')
    t.boolean('hasNextPage')
  },
})

const Response = objectType({
  name: 'Response',
  definition(t) {
    t.field('pageInfo', {type: PageInfo})
    t.list.field('edges', {
      type: Edge,
    })
  },
})



export const TransactionOrderByInput = inputObjectType({
  name: "TransactionOrderByInput",
  definition(t) {
    t.field('date', { type: Sort })
  },
})

export const Sort = enumType({
  name: "Sort",
  members: ["asc", "desc"],
})

export const schema = makeSchema({
  types: [
    Query,
    Category,
    Mutation,
    Account,
    Transaction,
    DateTime,
    Response
  ],
  outputs: {
    schema: __dirname + '/../schema.graphql',
    typegen: __dirname + '/generated/nexus.ts',
  },
  contextType: {
    module: require.resolve('./context'),
    export: 'Context',
  },
  sourceTypes: {
    modules: [
      {
        module: '@prisma/client',
        alias: 'prisma',
      },
    ],
  },
})
