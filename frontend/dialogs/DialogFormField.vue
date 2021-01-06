<script>
export default {
  props: {
    label: String,
    type: String,
    name: String,
    defaultValue: String,
    validation: RegExp | String,
    validationMessage: String,
    autocomplete: String,
    defaultInfo: String,
    marked: Boolean,
  },

  data() {
    return {
      value: this.defaultValue || '',
      validationError: '',
    }
  },

  computed: {
    info() {
      return this.validationError || this.defaultInfo
    },

    failed() {
      return !!this.validationError
    },
  },

  methods: {
    validate(event) {
      this.$emit('input', this.value)
      if (this.value && this.validation && !this.value.match(this.validation)) {
        this.validationError = this.validationMessage || 'Ungültiger Wert'
      } else {
        this.validationError = ''
      }
    },
  },
}
</script>

<template>
  <label :class="{ marked }">
    <div class="label-text">{{ label }}</div>
    <div class="field-container">
      <input
        :type="type"
        v-model="value"
        :name="name"
        :autocomplete="autocomplete"
        @input="validate"
      />
      <div class="field-info" :class="{ failed }">{{ info }}</div>
    </div>
  </label>
</template>

<style lang="scss" scoped>
label {
  display: flex;
  width: 100%;
  line-height: 2.2em;

  &.marked input {
    border-color: red;
  }
}

.field-container {
  flex-grow: 1;
}

input {
  padding: 6px;
  box-sizing: border-box;
  width: 100%;
}

.field-info {
  font-size: 14px;
  line-height: 1.3em;
  margin-bottom: 10px;

  &.failed {
    color: red;
  }
}
</style>
