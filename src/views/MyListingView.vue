<script setup lang="ts">
import { useFilters, filterFactory } from '../composables/useFilters'

const { filters, resetFilters, changedFilters, haveFiltersChanged } = useFilters({
  schema: {
    searchString: filterFactory.stringFilter({
      default: '',
      debounced: 500,
    }),
    stringWithNoDefault: filterFactory.stringFilter({
      minLength: 2,
      maxLength: 10,
    }),
    myBoolean: filterFactory.booleanFilter({
      default: false,
    }),
    myArray: filterFactory.arrayFilter({
      default: ['any'],
    }),
    myNumber: filterFactory.numberFilter({
      default: 1,
      min: 1,
      max: 10,
    }),
    notInQuery: filterFactory.stringFilter({
      default: 'hidden',
      withoutQuery: true,
    }),
  },
})
</script>

<template>
  <table>
    <tbody>
      <tr>
        <td>searchString</td>
        <td><input v-model="filters.searchString" /></td>
      </tr>
      <tr>
        <td>stringWithNoDefault</td>
        <td><input v-model="filters.stringWithNoDefault" /></td>
      </tr>
      <tr>
        <td>myBoolean</td>
        <td>
          <input type="checkbox" v-model="filters.myBoolean" />
        </td>
      </tr>
      <tr>
        <td>myArray</td>
        <td>
          <label><input type="checkbox" v-model="filters.myArray" value="any" /> any</label>
          <label><input type="checkbox" v-model="filters.myArray" value="apple" /> apple</label>
          <label><input type="checkbox" v-model="filters.myArray" value="banana" /> banana</label>
          <label><input type="checkbox" v-model="filters.myArray" value="cherry" /> cherry</label>
        </td>
      </tr>
      <tr>
        <td>myNumber</td>
        <td><input v-model="filters.myNumber" type="number" /></td>
      </tr>
      <tr>
        <td>notInQuery</td>
        <td><input v-model="filters.notInQuery" /></td>
      </tr>
    </tbody>
  </table>

  <pre>{{ filters }}</pre>
  <pre>Have filters changed: {{ haveFiltersChanged }}</pre>
  <pre>Changed filters: {{ changedFilters }}</pre>
  <button @click.prevent="resetFilters()">Reset filters</button>
</template>

<style scoped>
:global(body) {
  font-family: sans-serif;
}

pre {
  background: #f0f0f0;
  padding: 8px;
}
</style>
