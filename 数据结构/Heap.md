# 什么叫堆
> 堆是一种特殊的数据结构，一般使用的是二叉堆，用来表示一个完全二叉树结构，但通常用数组存储。
> 满足堆积的特性：父节点总是小于（或大于)子节点
> 堆的操作：
操作	描述	时间复杂度
* build	创建一个空堆	O(n)
* insert	向堆中插入一个新元素	 O(log n)
* update	将新元素提升使其匹配堆的性质	
* get	获取当前堆顶元素的值	O(1)
* delete	删除堆顶元素	O(log n)
* heapify	使删除堆顶元素的堆再次成为堆	
> 堆的java实现：优先队列
> 建二叉堆的时间复杂度

# 为什么使用堆
> 现实生活中，任务总是存在优先级的，对于传统的队列都是 先进先出，不能实现优先级这一条件，而堆这种数据结构可以总是让优先级最大的先出队，然后次大的移动至队头。堆用来实现优先队列是非常重要的。
> 可以优化排序算法，堆排序的时间复杂度为O(N*log(N))
# 堆可以用来干什么
## 堆排序
> 以最大堆为例
>
import java.util.ArrayList;
public class HeapSort{
    int[] arr;
    // 构造函数
    public HeapSort(int[] arr){
        this.arr = arr;
    }
    // 辅助函数
    // 交换两者位置
    private swap(int i, int j){
        int tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
    // index: 表示需要调整的节点索引
    // len: 未排序的堆的长度
    public void maxHeapify(int index, int len){
        int li = (index <<1) + 1; // 左子节点的索引
        int ri = li + 1 ; // 右子节点的索引
        // 终止条件
        if(li > len){
            return; // 已经超过了len的长度
        }
        int cMax = li; // 子节点中的最大值索引，默认为左节点
        // 如果ri在范围内且ri的值比较大
        if(ri<=len && arr[ri]>arr[li]){
            cMax = ri;
        }
        // 如果不满足最大堆的条件，交换cMax和index
        if(arr[cMax] > arr[index]){
            swap(cMax, index);
            // 交换了之后是否满足
            maxHeapify(cMax, len);
        }
    }
    // 排序
    public void sort(){
        // 第一步，构造二叉堆
        // 只需要观察叶子节点是不是满足堆的条件
        // 最后一个父节点为 floor((len-1)/2) 
        int len = arr.length - 1;
        int beginIndex = (len - 1) / 2;
        for(int i = beginIndex; i >=0; i--){
            maxHeapify(i, len);
        }
        // 第二步，将堆顶元素与尾部交换, 然后遍历长度-1
        // 然后对不满足的，和其相关的更新了即可，不需要全部更新
        for(int i = len; i > 0; i--){
            swap(0, i);
            maxHeapify(0, i - 1); //
        }    
    }
}


# 优先队列
