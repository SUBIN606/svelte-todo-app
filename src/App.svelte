<script>
	import Input from "./components/Input.svelte";
	import Todos from "./components/Todos.svelte";

	let todoList = [
    {
      id: new Date(),
      text: "할일이 산더미다",
      completed: false
    },
    {
      id: new Date(),
      text: "할일이 없나?",
      completed: false
    },
    {
      id: new Date(),
      text: "할일을 미루고싶다",
      completed: true
    }
  ];
</script>

<main>
	<div>
		<p>To Do List</p>
		<Input/>
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