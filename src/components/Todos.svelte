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