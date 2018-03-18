# 什么是栈
> 栈是一种常用的数据结构，只允许在一端进行操作，有后进先出的规律
> 栈有三种动作：
1. 增加：push操作，从栈顶推入
2. 删除：pop操作，从栈顶弹出
3. 查询：peek操作，获取栈顶元素
# 为什么使用栈
> 递归，天然就是递归的结构
> 回溯
> 
# 栈的常用算法
## 使用链表实现栈
> 实现栈既可以用数组，也可以用链表，为了方便扩充，使用链表实现
> 为了知道出栈之后，top变为哪个结点，链表应该使用前驱结点，而非后驱结点
    // 链表结点
    public class ListNode{
        int val;
        ListNode pre; // 前驱节点
        public ListNode(int val){
            this.val = val;
        }
    }
    // Stack类
    public class Stack{
        // 成员变量 top节点，栈的最高点
        ListNode top;
        // 增加操作，入栈操作
        public void push(int data){
            ListNode node = ListNode(data);
            node.pre = top;
            top = node;
        }
        // 删除操作，出栈操作
        // 返回top节点的值
        public int pop(){
            if(top==null){
                return null;
            }
            ListNode result = top;
            top = top.pre; // 出栈操作
            return result.val;
        }
        // 取栈顶元素
        // 但不出栈
        public int peek(){
            if(top == null){
                return null;
            }
            return top.val;
        }
    }
## 使用ArrayList实现栈更方便，只需要在索引为0的位置进行操作即可

## 使用两个队列实现栈
> 使用两个队列实现栈的原理：利用队列1实现入队，利用队列2作为缓存，队列1中出队即可，设当前队列1里数为1，2，3，那么出队时，先将1，2入队至队列2，然后将3出队，最后将队列2中的元素重新入队，这个想法也是66的
> 先写出了以下这版
    // 栈结构
    public class Stack{
        Queue<Integer> queue1 = new LinkedList<>();
        Queue<Integer> queue2 = new LinkedList<>();
        // 进栈
        public void push(int data){
            queue1.add(data);
        }

        // 弹栈
        public int pop(){
            // abnormal situation：空栈
            if(queue1.isEmpty()){
                return null; 
            }
            // 将queue1中的前n-1个元素加入queue2
            while(queue1.size() > 1){
                queue2.offer(queue1.poll());
            }
            // 此时仅存一个元素，那么出队
            int result =  queue1.poll();
            // 将queue2中的元素重新价值
            while(queue2.size()>0){
                queue1.offer(queue2.poll());
            }
            return result;
        }
    }
> 这一版出现，有了不必要的开销，就是将入栈，出栈的队列固定了之后，会导致需要多做一些操作，在时间复杂度上做优化的话，可以使一个队列为空，一个队列有值。入栈：如果一开始两个队列都为空的话，那么任取一个队列(queue1)即可，否则取不为空的队列入栈 出栈：将不为空的前n-1个数据出队到另一个队列，然后将最后一个元素出队
> 
public class stack{
    Queue<Integer> queue1 = new LinkedList<>();
    Queue<Integer> queue2 = new LinkedList<>();
    // 入栈
    public void push(int v){
        if(!queue1.isEmpty()){
            queue1.offer(v);
        }else{
            queue2.offer(v);
        }
    }
    // 出栈
    // 看那个队列不为空
    public int pop(){
        // 异常情况
        if(queue1.isEmpty() && queue2.isEmpty()){
            return null;
        }
        // 如果queue1不为空
        if(!queue1.isEmpty()){
            while(queue1.size()>1){
                queue2.add(queue1.poll());
            }
            return queue1.poll();
        }
        // queue2不为空
        else{
            // 将queue1de1接入
            while(queue2.size()>1){
                queue1.add(queue2.poll());
            }
            return queue2.poll();
        }
    }
}
## 最小栈问题
> 以O(1)的时间复杂度实现栈中最小元素
> 最小栈问题，一般的遍历，会设置一个变量min，每次入栈会比较与min的大小，但是如果有元素出栈，min应该怎么办呢？解决方法是添加一个辅助栈(以空间为代价，减少时间复杂度)
> 使用ArrayList来实现栈
> 
    import java.util.*;
    public class MinStack{
        ArrayList<Integer> dataStack = new ArrayList<>();
        Stack<Integer> minStack = new Stack<>();
        // 入栈操作,注意更新minStack
        public void push(int data){
            dataStack.add(0, data);
            // 如果最小为空
            if(minStack.isEmpty()){
                minStack.push(data);
            }
            else{
                int currentMin = minStack.peek();
                minStack.push(currentMin < data?data:currentMin);
            }
        }

        // 出栈操作,注意更新minStack
        public int pop(){
            // dataStack
            if(dataStack.isEmpty()){
                return null;
            }
            else{
                minStack.pop();
                int result = dataStack.get(0);
                dataStack.remove(0); // 首元素删除
                return result;
            }
        }
        // 取栈顶元素
        public int peek(){
            if(dataStack.isEmpty()){
                return null;
            } 
            return dataStack.get(0);
        }

        public int min(){
            return minStack.peek();
        }
    }

## 判断栈的push和pop是否一致
> 栈的入栈和出栈问题
> 需解决问题：什么样的顺序是有问题的？
> 有两种思路？一种是观察什么情况是错误的？还有一种是利用辅助栈进行模拟
> 观察错误情况：从1开始遍历数组，如果出现了后进后出且前面出现了比其更晚入栈的，那就出现了顺序错误
>
import java.util.HashMap;
public boolean IsPopOrder(int [] pushA,int [] popA) {
      // 异常情况
    if(pushA.length < 1){
        return false;
    }
    // 构造索引
    HashMap pushIndex = new HashMap();
    for(int i = 0; i < pushA.length; i++){
        pushIndex.put(pushA[i], i);
    }
       // 遍历弹栈数组
    // 取前面的最大索引
    int prevPushMaxIndex = -1;
    for(int i = 0; i < popA.length; i++){
        // 异常判断,如果前后不一致
        if(!pushIndex.containsKey(popA[i])){
            return false;
        }
         // 出现后进后出的点，判断该点是否合理
        if(i > 1 && pushIndex.get(popA[i]) - pushIndex.get(popA[i-1]) > 0){
            // 判断之前出现的，有没有比该点更晚入栈，如果有则为false
            if(prevPushMaxIndex > pushIndex.get(popA[i])){
                return false;
            } 
        }
        // 获取的最大索引
        if(pushIndex.get(popA[i]) > prevPushMaxIndex){
            prevPushMaxIndex = pushIndex.get(popA[i]);
        }
    }
    return true;
}
> 如果使用模拟的方式，加入一个辅助栈
public boolean IsPopOrder(int [] pushA,int [] popA) {
    Stack<Integer> stack = new Stack<Integer>();
    // 模拟入栈和出栈
    for(int i = 0, j=0; i < pushA.length; i++){
        stack.push(pushA[i]);
        // 判断是否能够出栈
        while(stack.szie() > 0 && stack.peek() == data[j]){
            stack.pop(); // 出栈
            j++; // 出栈的元素到下一个了
        }
    }
    return stack.size() == 0;
}

