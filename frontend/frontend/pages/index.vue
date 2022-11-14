<template>
  <v-app >
    <div>
      <v-card>
        <v-card-title>Transactions
        </v-card-title>
        <v-container fluid>
          <v-row align="center">
            <v-col
              class="fill-width"
            >
              <v-text-field
                v-model="search"
                label="Search"
              ></v-text-field>
            </v-col>
            <v-col
              class="fill-width"
            >
              <v-select class="fill-width"
                        v-model="filters.category"
                        :items="categories"
                        item-text="name"
                        label="Categories"
                        @input="filterTransactions()"
                        multiple
                        Categories
              >
              </v-select>
            </v-col>
            <v-col
              class="fill-width"
            >
              <v-select
                v-model="filters.bank"
                :items="banks"
                item-text="bank"
                label="Banks"
                @input="filterTransactions()"
                multiple
                Categories
              >
              </v-select>
            </v-col>
          </v-row>
        </v-container>
        <v-data-table
          :headers="headers"
          :items="filteredTransactions"
          :footer-props="{
        'items-per-page-options': [-1, 10, 20],
      }"
          :items-per-page="-1"
          :search="search"
          :loading="loading"
          item-key="id"
          class="row-pointer"
          @click:row="handleClick"

        >
          <template v-slot:top>
            <v-dialog v-model="dialog" max-width="1200px">
              <v-card>
                <v-card-title>
                  <span class="headline">Details</span>
                </v-card-title>
                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12" sm="12" md="6">
                        <v-text-field color="black" v-model="editedItem.bank" label="Bank" readonly disabled
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="12" md="6">
                        <v-text-field v-model="editedItem.account" label="Account" readonly disabled
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="12" md="6">
                        <v-text-field v-model="editedItem.reference" label="Reference" readonly disabled
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <v-text-field v-model=" editedItem.amount" label="Amount" readonly disabled
                        ><span class="float-right">{{ editedItem.amount }} {{editedItem.currency}}</span>
                        </v-text-field>
                      </v-col>
                      <v-col ccols="12" sm="6" md="6">
                        <v-text-field color="black" v-model="new Date(editedItem.date).toLocaleString()" label="Date" readonly disabled></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <v-text-field color="black" v-model="editedItem.currency" label="Currency" readonly disabled></v-text-field>
                      </v-col>
                      <v-combobox
                        label="Category (Edit)"
                        :items="categoryNames"
                        v-model="editedItem.category"
                        return-object
                        ref="combo"
                      ></v-combobox>
                    </v-row>
                  </v-container>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
                  <v-btn color="blue darken-1" text @click="save">Save</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </template>
          <template v-slot:item.category="{ item }">
            <v-chip
              :key="categoriesWithColors"
              :color="getColor(item.category)"
              light
            >
              {{ item.category }}
            </v-chip>
          </template>
          <template v-slot:item.date="{ item }">
            <span>{{ new Date(item.date).toLocaleDateString() }}</span>
          </template>
          <template v-slot:item.amount="{ item }">
            <span class="float-right">{{ item.amount }} {{item.currency}}</span>
          </template>
          <template v-slot:footer.page-text>
            <v-btn
              color="primary"
              dark
              class="ma-2"
              @click.native="loadMoreTransactions()">
              Load More
            </v-btn>
          </template>
        </v-data-table>
      </v-card>
    </div>
  </v-app>
</template>
<style>
.row-pointer > .v-data-table__wrapper > table > tbody > tr:hover {
  cursor: pointer;
}
</style>
<script>
import axios from "axios";
import * as _ from 'underscore';

export default {

  data() {
    return {
      search: '',
      transactions: [],
      filteredTransactions: [],
      banks: [],
      pageInfo : {},
      categories: [],
      categoriesWithColors: [
        {
          "id": "6ad0e563-7f94-417d-8370-7eca2e52b2cc",
          "name": "Advertising",
          "color": "7048a3"
        },
        {
          "id": "0c600155-27a0-40ce-9df5-523f2831ff56",
          "name": "Charges/Fees",
          "color": "ffbf84"
        },
        {
          "id": "f630d7f1-afb9-4713-b51b-265558836753",
          "name": "Check Outflows",
          "color": "ffbf84"
        },
        {
          "id": "977a3d02-364d-4c88-9856-85cd93a361ef",
          "name": "Company Investments",
          "color": "958e80"
        },
        {
          "id": "350a5a32-beee-47f3-bb71-3814d4a7082a",
          "name": "Contractors",
          "color": "f6f2ab"
        },
        {
          "id": "f41d7624-1187-412a-b314-80a6832f81c0",
          "name": "Credit Card",
          "color": "ffbf84"
        },
        {
          "id": "49b11f13-8eb6-417d-aa02-467d1686c003",
          "name": "Debt Investment",
          "color": "958e80"
        },
        {
          "id": "b61354fc-c493-46fe-8edd-87da4f503965",
          "name": "Debt Repayment",
          "color": "958e80"
        },
        {
          "id": "ca9d3311-7446-4615-b071-5fe05f4e1be9",
          "name": "Eating Out",
          "color": null
        },
        {
          "id": "0bc45cf5-6dc7-4cfb-bae4-b740816862ac",
          "name": "Equity investment",
          "color": "958e80"
        },
        {
          "id": "3e384a41-01f2-4978-b10e-73dba7cb6878",
          "name": "Financing Expense",
          "color": "958e80"
        },
        {
          "id": "e9641f65-f89a-4278-b490-4f2c4fa6e2f7",
          "name": "Financing Income",
          "color": "958e80"
        },
        {
          "id": "e4cb1102-1e2d-407e-b986-a7f14a7f0835",
          "name": "General Payment",
          "color": "ffbf84"
        },
        {
          "id": "ed46831b-5c6d-49d5-a6a5-8e764ffa9b14",
          "name": "Insurance",
          "color": "ffbf84"
        },
        {
          "id": "f0fd67cd-8c38-4883-8a39-529974b6f3a1",
          "name": "Internal Transfers",
          "color": null
        },
        {
          "id": "f805cb0b-af81-419b-a336-df6d79f16093",
          "name": "Inventory",
          "color": "ff6955"
        },
        {
          "id": "f3e86a41-ccd8-4976-82c9-aed0a1ea2989",
          "name": "Legal",
          "color": "ffbf84"
        },
        {
          "id": "536d9623-863d-4011-a04a-31e85066810d",
          "name": "Operating Expenses",
          "color": "ffbf84"
        },
        {
          "id": "42169f4c-9aea-47f1-ab98-f41d379b0bad",
          "name": "Other Expenses",
          "color": "ffbf84"
        },
        {
          "id": "0ca2a326-085d-45c8-8a15-9e72f2598104",
          "name": "Overdraft/NSF Fees",
          "color": "ffbf84"
        },
        {
          "id": "c134faed-5c47-4b76-8439-3f3c808ef782",
          "name": "Payroll and Consultants",
          "color": "f6f2ab"
        },
        {
          "id": "c3189eec-282a-4680-abab-006611b02d76",
          "name": "Personnel",
          "color": "f6f2ab"
        },
        {
          "id": "292c404b-a504-4bb7-abcd-a50816620330",
          "name": "Postage",
          "color": "ffbf84"
        },
        {
          "id": "013d830c-ee70-4a0b-81dd-1edce790f435",
          "name": "Reconciled Intra-Company Transfers",
          "color": null
        },
        {
          "id": "c8b4af5c-916f-432f-b7b5-f4e9a351e688",
          "name": "Refunds",
          "color": "acdcff"
        },
        {
          "id": "0afaa716-66a6-41ed-a577-1cc4bc6ed076",
          "name": "Rent",
          "color": "ffbf84"
        },
        {
          "id": "80304577-2f6b-481f-bf46-28d243046b66",
          "name": "Revenue",
          "color": "75b970"
        },
        {
          "id": "761ef302-53e5-4d3b-a076-7292ac19f0fd",
          "name": "Salary Taxes",
          "color": "f6f2ab"
        },
        {
          "id": "8d92fd50-06b8-494c-b732-cd0b98f10b3c",
          "name": "Sales and Marketing",
          "color": "7048a3"
        },
        {
          "id": "11bb7aa7-61e6-4753-b3f2-365f83694417",
          "name": "Social Security Contributions",
          "color": "f6f2ab"
        },
        {
          "id": "d2f6df72-a6e6-4fc2-9221-9864406447f0",
          "name": "Software",
          "color": "ffbf84"
        },
        {
          "id": "0ad649ed-175e-45c2-9194-2a78f3bf219c",
          "name": "Special Inflows",
          "color": null
        },
        {
          "id": "cb55a2e0-0299-449d-bd81-6d1a71e8b0da",
          "name": "Special Outflows",
          "color": null
        },
        {
          "id": "7e1a5138-67b3-4d57-8b1c-e69ffee2e126",
          "name": "Tax Refund",
          "color": "acdcff"
        },
        {
          "id": "66faa5fe-b264-48b9-9a0d-e8ef27b10cf8",
          "name": "Taxes",
          "color": "f3e7cf"
        },
        {
          "id": "e5e088d9-ab98-450c-be61-ef7b85940a0b",
          "name": "Travel",
          "color": "ffbf84"
        },
        {
          "id": "2059e527-77e3-443e-80f7-d38dc9656b55",
          "name": "Unreconciled Intra-Company Transfers",
          "color": null
        },
        {
          "id": "a5f851cb-f3ff-41e3-8629-929395e65d50",
          "name": "Utilities",
          "color": "ffbf84"
        },
        {
          "id": "2ecef92e-954e-4b42-9ce0-9e25194a53d5",
          "name": "Vendors",
          "color": "ff6955"
        }
      ],
      categoryNames: [],
      headers: [
        {
          text: 'Account',
          value: 'account',
        },
        { text: 'Category', value: 'category' },
        { text: 'Amount',
          align: 'right',
          sortable: false,
          value: 'amount' },
        { text: 'Date',
          align: 'right',
          sortable: false,
          value: 'date' },
      ],
      filters: {
        category: [],
        bank: [],
        account: [],
        startMonth: [],
        endMonth: [],
      },
      loading: true,
      singleExpand: false,
      expanded: ["bank", "account", "reference","category", "date", "amount"],
      dialog: false,
      editedIndex: -1,
      editedItem: {
        id: "",
        category: "",
        reference: "",
        amount: null,
        currency: "",
        date: null,
        account: "",
        bank: "",
      },
      defaultItem: {
        id: "",
        category: "",
        reference: "",
        amount: null,
        currency: "",
        date: null,
        account: "",
        bank: "",
      },
    };
  },

  async mounted() {
    try {
      var result = await axios({
        method: "POST",
        url: "http://localhost:4000/",
        data: {
          query: `{
            transactionsWithPagination(first: null, after: null) {
    pageInfo {
      endCursor
      hasNextPage
    }
    edges {
      cursor
      node {
        id
        category
        reference
        amount
        currency
        date
        account
        bank
        accountId
        categoryId
      }
    }
  }
          }`
        }
      })

      let res = result.data.data.transactionsWithPagination

      let transactions = []
      for (let t of res.edges){
        transactions.push(t.node)
      }
      this.pageInfo = res.pageInfo
      this.transactions = transactions;
      this.filteredTransactions = transactions;

      this.getCategories()
      this.getBanks()
      this.loading = false

    } catch (error){
      console.error(error)
    }

    // init categoryNames array
    for (let cat of this.categoriesWithColors){
      this.categoryNames.push(cat.name)
    }


  },
  methods: {
    getColor (category) {
      for (let cat of this.categoriesWithColors){
        if (cat.name == category) {
          if (cat.color != null ) {
            return "#" + cat.color.toUpperCase()
          } else {
            return
          }
        }
      }
      return
    },

    async loadMoreTransactions(){
      try {
        this.loading = true
        let result = await axios({
          method: "POST",
          url: "http://localhost:4000/",
          data: {
            query: `{
            transactionsWithPagination(first: 30, after: "`+ this.pageInfo.endCursor+`") {
               pageInfo {
                endCursor
                hasNextPage
              }
              edges {
                cursor
                node {
                id
        category
        reference
        amount
        currency
        date
        account
        bank
        accountId
        categoryId
              }
            }
          }
          }`
          }
        })
        let res = result.data.data.transactionsWithPagination

        let transactions = []
        for (let t of res.edges){
          transactions.push(t.node)
        }
        this.pageInfo = res.pageInfo


        transactions = this.transactions.concat(transactions);

        this.transactions = _.uniq(transactions, 'id');


        this.filterTransactions()
        this.getBanks()
        this.getCategories()
        this.loading = false
      } catch (error){
        console.error(error)
      }
    },

    filterTransactions() {
      let res =  []

      let catFilterEnabled = this.filters.category.length > 0
      let bankFilterEnabled = this.filters.bank.length > 0
      if (catFilterEnabled){ // category filter
        for (let t of this.transactions){
          if (this.filters.category.includes(t.category)) {
            res.push(t)
          }
        }
      } else { // cat filter not enabled
        res = this.transactions // -> res equal to transactions.
      }
      if (bankFilterEnabled){ // bank filter
        let cat_bank_filtered = []
        for (let t of res){
          if (this.filters.bank.includes(t.bank)) {
            cat_bank_filtered.push(t)
          }
        }
        res = cat_bank_filtered
      }

      this.filteredTransactions = res

    },

    getCategories(){
      let categories = new Set()
      for (let t of this.filteredTransactions){
        categories.add(t.category)
      }
      this.categories = Array.from(categories.values())
    },

    getBanks(){
      let banks = new Set()
      for (let t of this.filteredTransactions){
        banks.add(t.bank)
      }
      this.banks = Array.from(banks.values())
    },


    handleClick(item) {
      console.log("handleClick")
      this.editedIndex = this.filteredTransactions.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },
    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },
    save() {

      let newCat = true
      for (let cat of this.categoriesWithColors){
        if(cat.name == this.editedItem.category){ // existing category
          this.editedItem.categoryId = cat.id
          newCat = false
        }
      }
      if(!newCat){
        console.log("not a new Category")
        // update category field in arrays
        this.filteredTransactions[this.editedIndex].category = this.editedItem.category
        this.filteredTransactions[this.editedIndex].categoryId = this.editedItem.categoryId

        for (let t in this.transactions){
          if (t.id == this.filteredTransactions[this.editedIndex].id){
            t.category = this.editedItem.category
            t.categoryId = this.editedItem.categoryId
          }
        }
        this.updateTransactionsDB(this.editedItem.categoryId, this.editedItem)

      } else {
        console.log("new Category")
        this.filteredTransactions[this.editedIndex].category = this.editedItem.category
        let cat = {
          name: this.editedItem.category,
          color: null,
          id: null
        }
        this.categoryNames.push(cat.name)
        this.categoriesWithColors.push(cat)

        this.updateCategoriesDB(this.editedItem)
        }
      this.close();
    },


    async updateCategoriesDB(editedItem){
      console.log("updateCategoriesDB")
      let catId = ""
      try {
        let response = await axios({
          method: "POST",
          url: "http://localhost:4000/",
          data: {
            query: `mutation {
              createCategory(name: "`+editedItem.category+`", color: null) {
                color
                id
                name
              }
            }`
          }
        })
        catId = response.data.data.createCategory.id
      } catch (error){
        console.error(error)
      }
      await this.updateTransactionsDB(catId, editedItem)
      this.getCategories()
    },



    async updateTransactionsDB(catId, editedItem){
      console.log("updateTransactionsDB")

      try {
        let result = await axios({
          method: "POST",
          url: "http://localhost:4000/",
          data: {
            query: `mutation {
            updateTransactionCategory(id: "`+editedItem.id+`", category: "`+editedItem.category+`", categoryId: "`+catId+`") {
              id
              category
              reference
              amount
              currency
              date
              account
              bank
              accountId
              categoryId
            }
            }`
          }
        })
      } catch (error){
        console.error(error)
      }
    },

  },
  watch: {
    dialog(val) {
      val || this.close();
    },
  },

};

</script>


