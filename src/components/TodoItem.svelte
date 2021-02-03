<script>
  export let todo;
</script>

<div>
  <input type="checkbox" checked={todo.completed}/>
  <p>{todo.text}</p>
  <button>x</button>
</div>

<style>
  div {
    display: flex;
    align-items: center;
  }
</style>