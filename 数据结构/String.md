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
> String取值
    char x = s2.charAt(1); // 'r'
> String获取索引
    int index = s2.indexOf('r') // 1
> String将char[]转化为String
    String s = String.valueOf(s2Char); // "bruce"

## String类的其他用法
length() 返回字符串长度
isEmpty() 返回字符串是否为空
charAt(int index) 返回字符串中第（index+1）个字符
char[] toCharArray() 转化成字符数组
trim() 去掉两端空格
toUpperCase() 转化为大写
toLowerCase() 转化为小写
String concat(String str) //拼接字符串
String replace(char oldChar, char newChar) //将字符串中的oldChar字符换成newChar字符
//以上两个方法都使用了String(char[] value, boolean share)；
boolean matches(String regex) //判断字符串是否匹配给定的regex正则表达式
boolean contains(CharSequence s) //判断字符串是否包含字符序列s
String[] split(String regex, int limit) 按照字符regex将字符串分成limit份。
String[] split(String regex)

## StringBuider主要用法
> StringBuilder申明
    StringBuilder s3 = new StringBuilder(s2.substring(2, 5));
> StringBuilder增加
    s3.append('bill');
> StringBuilder -> String
    s3.toString();
## StringBuffer主要用法
> 与StringBuilder同, StringBuffer为线程安全型， StringBuilder为线程不安全型
## 三者的主要区别
### String: 字符串常量：常量不涉及修改所以不存在线程安全问题
> String和StringBuffer的区别就是可不可变, String是不可变的字符串常量
> 修改字符串通常是生成一个新的字符串对象，然后将引用指向该对象
### StringBuffer: 字符串变量(线程安全型)
> StringBuffer则有常用的append方法用于改变字符串
> StringBuffer是对自身进行改变，所以速度会比较快
### StringBuilder: 字符串变量(线程不安全型)
> StringBuilder是针对单线程的可变量，由于不需要实现线程安全，故速度比较快
一般来说：速度上：
StringBuilder > StringBuffer > String
### 线程安全
> 之所以会出现线程安全问题，因为方法区和堆都是线程共享的，一般存在写入的方法就会存在该问题
> 当同时有多个线程修改数据时，会导致数据污染或数据不一致
> synchronized即为同步锁，修饰某个方法时，当多个线程方法某个成员方法或者成员变量时，必须等到当前线程访问结束之后，才允许下一个线程访问
> 所以线程安全的类，会在方法上增加同步锁，以实现线程安全，如StringBuffer,Vector,HashTable,Enum等
# String类源码解读
## 构造方法
### 基本方法
> 利用char[]构造
public String(char value[]) {
    this.value = Arrays.copyOf(value, value.length);
}
> 取其子集，注意异常情况的判断
public More ...String(char value[], int offset, int count) {
    if (offset < 0) {
    throw new StringIndexOutOfBoundsException(offset);
    }
    if (count < 0) {
        throw new StringIndexOutOfBoundsException(count);
    }
    // Note: offset or count might be near -1>>>1.
    if (offset > value.length - count) {
        throw new StringIndexOutOfBoundsException(offset + count);
    }
    this.value = Arrays.copyOfRange(value, offset, offset+count);
}
### 保护类型的构造方法
>
String(char[] value, boolean share) {
    // assert share : "unshared not supported";
    this.value = value;
}
> String(char[] value)方法在创建String的时候会用到会用到Arrays的copyOf方法将value中的内容逐一复制到String当中，
> 而这个String(char[] value, boolean share)方法则是直接将value的引用赋值给String的value,速度上自然会快很多
> 该构造方法为protected，不能设为公有，因为一旦设为公有，char[] value 在外部变化时，就会导致String发生变化
> 该方法存在一个致命缺点，由于对象中是共享另一个字符数组，当对象回收时，那个数组并不会回收，这就导致了内存泄露
> 所以在新版的substring方法中已经放弃了该方法，因为使用该构造方法会导致，原字符串对象被回收时，数组对象被共享，导致不会被回收，
如果原数组不回收，会导致严重的内存泄露

## 重写了equal方法
>
public boolean equals(Object anObject) {
        // 如果引用相同，必然相同
        if (this == anObject) {
            return true;
        }
        // 如果是字符串类型，那么逐个比较字符数组的每个字符
        if (anObject instanceof String) {
            String anotherString = (String) anObject;
            int n = value.length;
            if (n == anotherString.value.length) {
                char v1[] = value;
                char v2[] = anotherString.value;
                int i = 0;
                while (n-- != 0) {
                    if (v1[i] != v2[i])
                            return false;
                    i++;
                }
                return true;
            }
        }
        return false;
    }

## KMP算法
> 这个算法是字符串匹配中非常经典的算法，将字符串的匹配从O(N*M)复杂度减少至O(N+M)