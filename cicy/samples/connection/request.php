<?php
  // seed with microseconds
  function make_seed()
  {
    list($usec, $sec) = explode(' ', microtime());
    return (float) $sec + ((float) $usec * 100000);
  }
  srand(make_seed());

  $s = rand(1, 10);
  sleep($s);
  echo "随机停留{$s}秒<br>";
?>
众多的镜头给数码单反相机带来无穷的可能性