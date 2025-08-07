const AddQueueButton = ({player, onAdd}) => {
  return (
    <button className=" px-3 bg-blue-500 text-white  rounded-xl hover:bg-blue-600 cursor-pointer" onClick={()=> onAdd(player)}>
        Add Queue
    </button>
  )
}

export default AddQueueButton