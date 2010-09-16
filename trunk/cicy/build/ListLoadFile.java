public class ListLoadFile {
  
  private static java.io.FileFilter filter  = new java.io.FileFilter(){
    public boolean accept(java.io.File pathname){
    	if(pathname.isDirectory())
    	  return true;
    	String name = pathname.getName();
    	return name.lastIndexOf(".js") == name.length() - 3;
    }
  };
  
  private static String base = null;
  
  public static void main(String[] args) throws java.lang.Exception{
  	java.util.HashMap<String, String> envs = new java.util.HashMap();
  	String k = null;
  	String item = null;
    for(int i=0;i<args.length;i++){
    	item = args[i];
    	if(item.indexOf('-') == 0){
    	  if(k != null) {
    	  	envs.put(k, "true");
    	  }
    	  k = item;
    	}else if(k != null){
    		envs.put(k, item);
    		k = null;
    	}
    	
    }
	  if(k != null){
	    envs.put(k, "true");
	  }
	  
	  base = envs.get("-b");
	  
	  if(base == null){
	    base = "h:/cicy/";
	  }
    
    if(base.lastIndexOf("/") != base.length() -1)
      base += "/";
      
    if("true".equals(envs.get("-i"))){
       integrate(base);
    }
	  
    if("true".equals(envs.get("-l"))){
      listFiles(base);
    }
  }
  
  private static void integrate(String base) throws java.lang.Exception{
    java.io.File in = new java.io.File(base+"cicylib-all-debug.js");
    byte[] bs = new byte[(int)in.length()];
    java.io.FileInputStream fis = new java.io.FileInputStream(in);
    java.io.FileOutputStream fos = new java.io.FileOutputStream(base+"cicylib-all.js");
    
    fis.read(bs);
    fis.close();
    int ch=-1, start=0, end=0;
    for(int i=0;i<bs.length;i++){
      ch = bs[i];
      if(ch == '[')
       start = i;
      else if(ch == ']')
       end = i;
    }// 012 345 6
    String gets = new String(bs, start + 1 , end - start - 1);
    String[] as = gets.split(",");
    String fn = null;
    for(int j=0;j<as.length;j++){
    	fn = as[j].trim();
    	fn = fn.substring(1, fn.length() -1);
    	in = new java.io.File(base + fn);
    	bs = new byte[(int)in.length()];
    	System.out.println("writing "+fn+"..");
      fis = new java.io.FileInputStream(in);
      fis.read(bs);
      fis.close();
      fos.write(bs);
      fos.write('\n');
    }
    fos.close();
  }
  
  private static void listFiles(String base){
    java.io.File f = new java.io.File(base);
    java.util.List<String> set = new java.util.ArrayList<String>(100);
    navDir(set, f);
  }
  
  private static void navDir(java.util.List<String> set, java.io.File f){
    java.io.File[] list = f.listFiles(filter);
    for(int i=0;i<list.length;i++){
    	java.io.File ff = list[i];
      if(ff.isDirectory()){
         navDir(set, ff);
      }else {
      	String path = ff.getAbsolutePath().substring(base.length());
        System.out.println("\""+path.replace('\\','/')+"\",");
      }
    }
  }
  
}