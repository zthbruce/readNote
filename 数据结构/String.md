# String相关类
> 字符串是现实生活中非常重要的一类
> 掌握字符串用法对处理字符串有着非常大的意义
## String的主要用法
> String类表示字符串常量，属于不可变对象，改变String对象，每次都会生成一个新String对象，频繁改变String对象性能上会产生影响。
> String申明
    String s1 = new String();
    String s2 = "bruce";
> String长度
    int len = s1.length(); // 注意是方法，和数组不同，数组是变量
> String子字符串
    String sub_s2 = s2.substring(2, 5); // 'uce'
> String -> char[]
    char[] s2Char = s2.toCharArray(); // 字符串转化为字符数组

## StringBuider主要用法
> StringBuilder申明
    StringBuilder s3 = new StringBuilder(s2.substring(2, 5));
