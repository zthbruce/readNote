# 什么叫java对象引用
> 首先，搞清楚什么叫基本类型，什么叫引用类型
用例子说明就是：
int num = 3;
String s = "asas";
num是基本类型（基本数据类型包括byte, short, int, long, float, double, char,boolean8种)，值直接保存在变量里面
s是引用类型, "asas"的本质是new String("asas"), 这是新建的实际对象，实际对象中保存内容；s中存储的是对象的地址，这种变量称为引用，引用指向实际对象，类似于C++中指针。
> = 的意义
* 对于基本类型变量num，赋值运算符会改变num的值
* 对于引用类型变量s，赋值运算符会改变s存储的地址，但是原来的对象不会被改变，没有被引用指向的对象会被垃圾回收机制回收

# 为什么要有java对象引用
> 实际对象存储在堆中，而引用存储在速度更快的栈中
> 可以产生一个对象，其余都是指向它的引用，节约内存

# 参数调用, 本质上就是赋值运算
## 基本类型
    void foo(int value){
        value = 100;
    }
    foo(num); // num值不变

## 引用类型
> 没有提供改变自身方法的引用类型
    void foo(String text){
        text = "windows"
    }
    foo(s); // s不变

> 提供了改变自身方法的引用类型
    StringBuilder sb = new StringBuilder("iphone");
    void foo(StringBuilder builder) {
        builder.append("4");
    }
    foo(sb); // sb变化: "iphone" -> "iphone4"
> 使用了赋值运算符
    StringBuilder sb = new StringBuilder("iphone");
    void foo(StringBuilder builder){
        builder = new StringBuilder("iphone4");
    }
    foo(sb) // sb不变

> 对于基本类型，只传递值; 对于引用类型，传递的是地址的值
观察第三个例子和第四个例子:
第三个例子中传递了地址的值，之后两个引用都是指向同一个对象，一旦一个引用改变了指向对象的值，另一个引用也发生变化。
第四个例子中传递了地址的值，一开始sb和builder都指向"iphone", 但是builder = new StringBuilder("iphone4")这一赋值语句，让builder引用指向了iphone4,而sb仍然指向"iphone", sb不会变。
> 通过观察上述例子，可知不管是基本类型还是引用类型，传参就是传值运算，只是基本类型传真实值，而引用类型传地址值。





