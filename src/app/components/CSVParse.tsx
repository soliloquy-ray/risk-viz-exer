const CSVParse = ({ data, setData }: { data: any, setData: any }) => {

   
  const handleParse = (file: any) => {

      // Initialize a reader which allows user
      // to read any file or blob.
      const reader = new FileReader();
       
      // Event listener on reader when the file
      // loads, we parse it and set the data.
      reader.onload = async ({ target }: { target: any}) => {
          const csv: any = await csvJSON(target.result)
          setData(JSON.parse(csv))
          console.log(JSON.parse(csv));
      };
      reader.readAsText(file.target.files[0]);
  };

  const csvJSON = async (csv: any) => {

    const lines=csv.split('\r\n');
  
    const result = [];
  
    const headers=lines[0].split('\t');
  
    for(let i=1;i<lines.length;i++){
  
        const obj: any = {};
        const currentline=lines[i].split('\t');
  
        for(let j=0;j<headers.length;j++){
            obj[headers[j]] = isNaN(parseFloat(currentline[j])) ? currentline[j] : Number(currentline[j]);
        }
  
        result.push(obj);
  
    }
  
    //return result; //JavaScript object
    return Promise.resolve(JSON.stringify(result)); //JSON
  }
  return (
    <div className="h-[100%] w-full relative flex justify-between place-items-center px-2 py-3">
        <label htmlFor="csvInput" className="w-full absolute top-0 left-0 z-10 text-center m-auto text-2xl font-bold" style={{height: '100%'}}>
            Click here to upload a TSV source file
        </label>
        <input
          style={{opacity: 0}}
          onChange={handleParse}
          id="csvInput"
          name="file"
          type="File"
        />
    </div>
  )
}

export default CSVParse;