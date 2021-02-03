<script>
  export let todo;
  export let deleteTodo;
  export let handleComplete;
</script>

<div>
  <input type="checkbox" checked={todo.completed} on:change={()=>handleComplete(todo.id)}/>
  <p class:done={todo.completed}>{todo.text}</p>
  <button on:click={() => deleteTodo(todo.id)} />
</div>

<style>
  div {
    display: flex;
    align-items: center;
    align-content: center;
  }
  input{
    margin: 0.5rem;
  }
  p {
    flex: 1;
    font-size: 17px;
  }
  .done {
    text-decoration: line-through;
  }
  button {
    background-image: url("./delete.png");
    background-size: contain;
    background-position: center;
    width: 1.5rem;
    height: 1.5rem;
    background-color: rgba(0, 0, 0, 0);
    border: none;
  }
</style>