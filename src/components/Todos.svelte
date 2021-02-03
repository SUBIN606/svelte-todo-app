<script>
  import TodoItem from "./TodoItem.svelte";
  export let todoList;
  export let deleteTodo;
  export let handleComplete;
</script>

<div>
  {#each todoList as todo }
    <TodoItem {todo} {deleteTodo} {handleComplete}/>
  {/each}
</div>

<style>
  div {
    background: #fff;
    padding: 1rem;
    border-radius: 1rem;
    box-shadow: 6px 6px 15px rgb(0 0 0 / 10%);
    margin-top: 1rem;
  }
</style>