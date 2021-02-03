<script>
	import Input from "./components/Input.svelte";
	import Todos from "./components/Todos.svelte";

	let todo = "";
	let todoList = [
    {
      id: 1,
      text: "할일이 산더미다",
      completed: false
    },
    {
      id: 2,
      text: "할일이 없나?",
      completed: false
    },
    {
      id: 3,
      text: "할일을 미루고싶다",
      completed: true
    }
	];
	
	let lastId = todoList[todoList.length-1]['id'];

	let addTodo = () => {
    console.log("addTodo 실행");
	
    let newTodo = {
      id: ++lastId,
      text: todo,
      completed: false
		}
		
    todoList[todoList.length] = newTodo;
    todo = "";
	}
	
	let handleKeyUp = e => {
		todo = e.target.value;
		if(e.keyCode === 13) {
			addTodo();
		}
	}
</script>

<main>
	<div>
		<p>To Do List</p>
		<Input {todo} {addTodo} {handleKeyUp}/>
		<Todos {todoList} />
	</div>
</main>

<link rel="preconnect" href="https://fonts.gstatic.com">
<link href="https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap" rel="stylesheet">

<style>
	main {
		width: 100vw;
		height: 100vh;
		background-color:#f8f9fa;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	p {
		font-size: 3rem;
		font-family: 'Fredoka One', cursive;
		
	}
	div {
		width: 40vw;
		background-color:#f8f9fa;
		padding: 3rem;
		border-radius: 1rem;
		box-shadow: 
    7px 7px 19px 0 rgb(255 255 255 / 88%) inset, -7px -7px 19px 0 rgb(228 228 228) inset;
	}

	
</style>