# java常见基础问题总结
## 基本概念
### 为什么需要public static void main(String[] args)
> public static void main(String[] args)是java程序的入口方法，JVM在运行程序时，会先查找main()方法，public 是权限修饰符， static 表明main() 是个静态方法，不需要实例化对象也能执行。

> 通常来讲，要执行一个类的方法，必须实例化一个类的对象，然后通过对象调用方法
，main是设计成程序的入口方法，所以当程序运行时，应该不需要实例化类就可以调用该方法，所以main()方法被定义成 public and static

> public与static没有先后顺序，也可以把main方法定义成final
  