<script>
  import TodoItem from "./TodoItem.svelte";
  export let todoList;
</script>

<div>
  {#each todoList as todo }
    <TodoItem {todo}/>
  {/each}
</div>