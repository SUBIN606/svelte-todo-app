<script>
  import TodoItem from "./TodoItem.svelte";
  export let todoList;
</script>

<div>
  {#each todoList as todo (todo.id)}
    <TodoItem {todo}/>
  {/each}
</div>