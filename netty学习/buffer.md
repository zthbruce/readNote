# 什么叫buffer
> buffer中文名又叫缓冲区，在数据传输中，在内存中开辟的一块临时保存数据的区域。是一种化同步为异步的方式，即先保存，再处理。

> 基本上，涉及到IO读写的地方，都会存在buffer.就Java来说，我们非常熟悉的Old I/O--InputStream&OutputStream系列API，基本都是在内部使用到了buffer。NIO中将buffer封装成了对象，其中最常用的大概是ByteBuffer，使用方式为，将数据写入Buffer，flip()一下，然后将数据读出来。

> Netty中的buffer是专门为网络通讯而生的,叫ChannelBuffer
