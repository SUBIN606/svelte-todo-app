<script>
  export let todo;
  export let deleteTodo;
  export let handleComplete;
</script>

<div>
  <input type="checkbox" checked={todo.completed} on:change={()=>handleComplete(todo.id)}/>
  <p>{todo.id}{todo.text}</p>
  <button on:click={() => deleteTodo(todo.id)}>x</button>
</div>

<style>
  div {
    display: flex;
    align-items: center;
  }
</style>