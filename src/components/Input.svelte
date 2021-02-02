<script>
  export let todo = "";
</script>

<div>
  <input placeholder="할일을 입력하쇼" bind:value={todo}/>
  <button>ADD</button>
</div>

<style>
  div {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  input {
    flex: 1;
    font-size: 15pt;
    background-color: #ffffff7a;
    border-radius: 5rem;
    padding: 12px 18px;
    border: none;
    box-shadow: 6px 6px 15px rgb(0 0 0 / 10%);
    transition: 0.2s ease-out;
  }
  button:active, input:focus {
    box-shadow: 2px 2px 5px rgb(0 0 0 / 4%), -2px -2px 5px rgb(0 0 0 / 4%);
  }
  button {
    font-size: 15pt;
    background-color: #5f3dc4;
    color: #fff;
    padding: 12px 18px;
    border-radius: 5rem;
    margin-left: 0.5rem;
    border: none;
    box-shadow: 6px 6px 15px rgb(0 0 0 / 10%);
  }
</style>