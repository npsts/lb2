menu.onclick=function Navbar(){
    var x=document.getElementById('mynavbar')
    if(x.className==='navbar'){
        x.className+=' responsive';
    }else
    {
        x.className='navbar';
    }
}
