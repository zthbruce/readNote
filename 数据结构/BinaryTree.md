# 什么叫Binary Tree
> 先谈谈树
树是一个有N个节点，具有层次关系的集合，N=0时为空树，该数据结构有以下特点:
* 每个节点有零或多个子节点
* 没有父节点的称为根节点
* 非根节点只有一个父节点
* 除了根节点以外，每个子节点可以形成不相交的子树
> 有序树与无序树
* 树中任意节点的子节点之间没有顺序关系，这种树称为无序树
* 树中任意节点的子节点之间有顺序关系，这种树称为有序树
> 二叉树(BinaryTree)
二叉树是一种特殊的有序树，任一节点的子节点不超过2个，子树分为左子树和右子树，树主要为查找做服务，很多常用的索引都是采用树的结构进行设计的。

# 为什么用Binary Tree
> 更广义的来说，所谓数据结构，无非是用来描述(表达/解释)现实中存在的结构，所以当顺序表和链表这两种数据结构都是用来描述线性结构
> 对于1对k(k>1)的数据结构,一种抽象的描述就是树，k=2就是最常用的二叉树
> 在查找(搜索)的算法中，二叉树的引入会减少时间复杂度到O(log(N))，而线性表的查找线性复杂度为O(N)

# 常用的二叉树
## 满二叉树
> 除叶节点之外所有节点均有两个子节点，每层的节点数均达到最大(2^(k-1)),k表示第几层，总数为2^n -1,其中n为深度，所以必然为奇数
> 在满二叉树中，只要确定了节点编号，节点在树中的位置就确定，所以采用顺序结构即可存储满二叉树
> 满二叉树的集合长度是固定的，局限性较大，所以推出了完全二叉树的概念。

## 完全二叉树
> 设二叉树的深度为h,那么除h层以外，其余各层(1~h-1)层均达到最大个数，且h层的节点均在最左边，此为完全二叉树
> 完全二叉树的效率很高？(可以采用顺序结构存储，读取效率非常高)，二叉堆是采用完全二叉树的方式实现的
> 完全二叉树可以采用顺序表进行存储
## 二叉搜索(查找/排序)树
> 二叉搜索树是特殊的二叉树，满足以下性质:
* 若某节点的左子树不空的话，左子树上所有节点都小于该节点
* 若某节点的右子树不空的话，右子树上所有节点都大于该节点
> 二叉搜索树改善了树的搜索效率，拓扑结构好的二叉树深度h = log(N)，查找的时间复杂度由O(N) -> O(log(N)),这也说明了其严重依赖生成的二叉树结构。
> 于是，另一种二叉树应运而生，平衡二叉查找树

# 怎么使用Binary Tree
## 实现二叉树节点, 定义对象
public class TreeNode{
    public int val;
    public TreeNode left;
    public TreeNode right;
    public TreeNode(int val){
        this.val = val;
        this.left = this.right = null;
    }
}
## 二叉树遍历
> 二叉树遍历可以分为深度优先遍历和广度优先遍历(层次遍历)两种
> 深度优先遍历，到达一个节点，必须要先将以该节点为根的子树遍历完，然后再遍历同层的其他节点,深度优先遍历按照访问顺序包括:
* 先序遍历
* 中序遍历
* 后序遍历
> 广度优先遍历，也称为层次遍历，将同一层的节点访问结束之后再访问下一层节点
> 深度优先遍历通常使用递归的方式理解，广度优先遍历通常使用队列的方式进行

### 先序遍历
> 先访问根节点，再依次访问左子树，右子树(本身就是递归的想法)，递归必须要有终止条件
> 
    public void preOrder(TreeNode root){
        // 终止条件
        if(root==null){
            return;
        }
        System.out.println(root.val);
        preOrder(root.left);
        preOrder(root.right);
    }

> 非递归方式？理解如何解决该问题，而非死记硬背，还要看是否有意义，其实意义不大
> 以前写获取所有的geohash本质上就是先序遍历的方式
> 只不过邻居可以看成K叉树，利用循环的方式递归所有子树

### 中序遍历
> 先访问左子树，再访问根节点，后访问右子树
>
    public void inOrder(TreeNode root){
        // 终止条件
        if(root==null){
            return;
        }
        inOrder(root.left);
        System.out.println(root.val);
        inOrder(root.right);
    }
### 后序遍历
> 先访问左子树，再访问右子树，再访问根节点
>
    public void postOrder(TreeNode root){
        // 终止条件
        if(root==null){
            return;
        }
        postOrder(root.left);
        postOrder(root.right);
        System.out.println(root.val);
    }

### 广度优先遍历(层次遍历)
> 可以借助于队列这种数据结构存储每一层的节点
> 初始化将根节点存入队列Q
> 当队列Q不空的时候，弹出第一个节点作为访问节点，将该值的左右子节点入队，直到队列为空，即访问结束
> 
    public void levelVisit(TreeNode root){
        // 异常处理
        if(root == null){
            return;
        }
        // 初始化队列,利用LinkedList实现队列
        Queue<TreeNode> q = new LinkedList<TreeNode>();
        q.add(root);
        // 队列不为空
        while(!q.isEmpty()){
            TreeNode node = q.poll(); // 队首出队
            System.out.println(node.val); // 访问该值
            // 可以推广至k叉树，利用循环的方式入队即可
            if(node.left != null){
                q.add(node.left); // 队尾入队
            }
            if(node.right!=null){
                q.add(node.right); // 队尾入队
            }
        }
    }
> Queue是继承了Collection的接口，故必然有isEmpty()方法

## 求二叉树的深度
> 首先谈谈深度，所谓深度是针对节点N，从根节点到该节点的长度即为深度，假设根节点的深度为1，树中节点最大深度称为树的深度
> 采用左子树和右子树比较的方式，递归的结束条件应该是空节点，一旦空节点就到了叶节点，每递归一次深度就增加1
>
    public int maxDepth(TreeNode root){
        // 空节点为0，终止条件
        if(root == null){
            return 0;
        }
        // 左子树和右子树的较大值就是最大深度，注意设根节点的深度为1
        return Math.max(maxDepth(root.left), maxDepath(root.right)) + 1;
    }

## 求二叉树的最小深度
> 二叉树的最小深度定义 从根节点向下到达叶节点的经过的最少点数
>
    public int minDepth(TreeNode root){
        // 空节点为0，终止条件
        if(root == null){
            return 0;
        }
        int left = minDepth(root.left); // 左子树
        int right = minDepth(root.right); // 右子树
        // 此处有一个陷阱，就是不能直接照搬 Math.min(maxDepth(root.left), maxDepath(root.right)) + 1
        // 因为一旦出现了空子树，子树的深度为0，但并非我们定义的最小深度，必须是到叶节点
        // 如果左右子树中有存在空子树的，就选择非空的那个即可，空子树为0，故可以采用相加的方式
        if(root.left == null || root.right == null){
            return left + right + 1;
        }
        return Math.min(left, right) + 1; // 往上什一层
    }

## 求二叉树的节点个数
> 二叉树的题目都可以根据左右子树的思想进行递归
>
    public int nodeNumber(TreeNode root){
        // 终止条件，异常情况
        if(root == null){
            return 0;
        }
        // 以当前节点为根节点的树，节点数 = 左子树点数 + 右子树点数 + 1
        return nodeNumber(root.left) + nodeNumber(root.right) + 1;
    }

## 求二叉树中叶子节点的个数
> 采用左子树和右子树的思想进行递归
>
    public int leftNodeNumber(TreeNode root){
        // 终止条件
        if(root == null){
            return 0;
        }
        // 叶节点的定义
        if(root.left == null && root.left == null){
            return 1;
        }
        return leftNodeNumber(root.left) + leftNodeNumber(root.right);
    }

## 求二叉树第K层节点的个数
> 此问题的关键在于如何确定第K层的节点
> 类比于用递归的方式遍历，只需要往下走K-1次即可，即终止条件为K=1
> 既然参数中有k，那么用k来确定递归的层数，每次减一
>
    public int theKLevelNodeNumber(TreeNode root, int k){
        // 异常判断
        if(root == null || k < 1){
            return 0;
        }
        // 终止条件，当走k-1步即可
        if(k == 1){
            return 1;
        }
        return theKLevelNodeNumber(root.left, k-1) + theKLevelNodeNumber(root.right, k-1);
    }

## 判断二叉树是否为平衡二叉树
> 首先需要了解什么是平衡二叉树: 任一节点的左子树和右子树的深度之差<=1
> 最先想到的是遍历每个节点，然后每个节点求其左右子树的深度，应该怎么返回情况：
> 
> 终止条件：
* node == null? return true // 空的树也算是平衡的
* isAverge(root.left) && isAverge(root.right) && Math.abs(maxDepth(root.left) - maxDepth(root.right))<=1
> 如果直接利用求深度的函数 maxDepth, 进行递归
>
    // 利用maxDepth(利用树深度)
    public boolean isAverage(TreeNode root){
        if(root == null){
            return true;
        }
        // 当满足该条件时
        if(isAverge(root.left) && isAverge(root.right) && Math.abs(maxDepth(root.left) - maxDepth(root.right))<=1){
            return true;
        }
        // 不满足则返回false
        return false;
    }
> 上面不是一个好的算法，因为会重复的计算很多次深度，可以改造计算深度算法来进行优化

>  
    // 如果平衡就返回深度，如果不平衡就返回-1
    public int maxDepth2(TreeNode node){
        // 终止条件
        if(node == null){
            return 0;
        }
        int left = maxDepth2(node.left);
        int right = maxDepth2(node.right);
        int result;
        // 当左子树为-1或者右子树为-1或者当前左子树和右子树的高度差为-1，那么说明不平衡
        // 递推条件
        if(left == -1 || right == -1 || Math.abs(left - right) > 1){
            result = -1;
        }
        else{
            result = Math.max(left, right) + 1;
        }
        return result;
    }
    // 判断是否平衡
    public boolean isAverage(TreeNode root){
        return maxDepth2(root) != -1; // -1为不平衡的标志
    }

## 判断二叉树是否是完全二叉树
> 首先要知道什么是完全二叉树，完全二叉树：设树的深度为h，那么从1~h-1层，每层节点都达到最大，h层的节点都集中在最左边
> 其实这样的描述类似于层次遍历(广度优先遍历), 类比的思想，我们可以引入队列，一开始我是想，如果能够记录节点的左右left和right于val里面，那么问题就转化为left和right是否间隔出现，如果出现了连续的left或者连续的right，那么必然不是完全二叉树。return false,如果遍历完毕，则返回true;但该算法如果要求改变原树的内容和结构，局限性较大。
> 另一种算法，是观察完全二叉树的结构之后得出的，即一旦出现left节点不空，right节点为空的情况，那么不能够再出现比该left节点更加靠右，或者更加靠下的节点，即队列中之后的节点都不能存在子节点
>
    public boolean isComplete(TreeNode root){
        // 异常情况
        if(root == null){
            return false;
        }
        Queue<TreeNode> queue = new LinkedList<TreeNode>;
        queue.add(root);
        // 如果不为空
        while(!queue.isEmpty()){
            TreeNode current = queue.poll();
            boolean hasChild = true; // 之后队列能否拥有子节点
            // 不能拥有子节点的情况
            if(!hasChild){
                if(current.left!=null || current.right!=null){
                    return false;
                }
            }
            else{
                // 按情况分解
                if(current.left!=null && current.right!=null){
                    queue.add(current.left);
                    queue.add(current.right);
                }
                // 这种情况直接不满足完全二叉树都在左边的定义
                else if(current.left == null && current.right != null){
                    return false;
                }
                // 如果左节点存在, 右节点不存在，那么不能再出现比该左节点更右更下的节点，所以队列中的剩余节点不允许再有子节点
                else if(current.left != null && current.right == null){
                    queue.add(current.left);
                    hasChild = false;
                }
                // 最后就是子节点均为空的情况，那么之后的结点必然不能有子节点
                else{
                    hasChild = false;
                }
            }
        }
        // 默认返回true
        return true;
    }

## 二叉树是否相同
> 判断二叉树是否相同，问题类似于递归遍历节点，然后比较节点是否相同
>
    public boolean isSameTree(TreeNode r1, TreeNode r2){
        // 两者均为空指针
        if(r1 == null && r2 == null){
            return true;
        }
        // 一个空，一个不为空
        else if(r1 == null || r2 == null){
            return false; 
        }
        else{ 
            // 如果这三者都相同，必然相同
            return r1.val == r2.val && isSameTree(r1.left, r2.left) && isSameTree(r1.right, r2.right);
        }
    }

## 二叉树是否为镜像
> 判断二叉树是否为镜像，镜像的意思其实是左右互换，问题与上类似，只是左右节点需要做一转换
>
    public boolean isMirrorTree(TreeNode r1, TreeNode r2){
        // 两者均为空指针
        if(r1 == null && r2 == null){
            return true;
        }
        // 一个空，一个不为空
        else if(r1 == null || r2 == null){
            return false; 
        }
        else{ 
            // 如果这三者都相同，必然相同
            return r1.val == r2.val && isMirrorTree(r1.left, r2.right) && isMirrorTree(r1.right, r2.left);
        }
    }

## 生成镜像二叉树
> 类似于递归遍历，然后将左右子树左右互换
> 
    public TreeNode mirrorTree(TreeNode root){
        // 如果根节点为空
        if(root == null){
            return null;
        }
        // 左子树由右子树生成，右子树由左子树生成
        TreeNode left = mirrorTree(root.right);
        TreeNode right = mirrorTree(root.left);
        root.left = left;
        root.right = right;
        return root; // 返回根节点
    }

## 二叉查找树的查询
> 二叉查找树中，左子树恒小于根节点，右子树恒大于根节点，以此查找条件
> root为二叉查找树，val为待查找值
>
    public TreeNode binarySearch(TreeNode root, int val){
        // 异常条件
        if(root==null){
            return null;
        }
        // 如果相等
        if(root.val == val){
            return root;
        }
        else if(root.val > val){
            return binarySearch(root.left, val);
        }
        else{
            binarySearch(root.right, val);
        }
        return null;
    }

## 二叉查找树插入节点
> 二叉查找树节点插入过程类似于查找，实际上写入的过程本身就包括，寻址(查找) + 插入内容
> 返回结果：是否插入成功
>
    public boolean insertTree(TreeNode root, TreeNode node){
        // 异常情况
        if(root == null){
            root = node; // 该节点就是根节点
        }
        // 如果比root大
        if(root.val <= node.val){
            if(root.right == null){
                root.right = node;
                return true;
            }
            else{
                return insertTree(root.right, node);
            }
        }
        else{
            if(root.left == null){
                root.left = node;
            }
            else{
                return insertTree(root.left, node);
            }
        }
        return false; // 编译通过
    }

## 输入一个二叉树和一个整数，打印出节点值之和等于该整数的所有路径
> 首先说一说所谓路径：一般来说，路径指的是从根节点到叶子节点的节点序列;
> 实际上递归本身就是压栈，而每次递归都会就增加了一个新的元素，为了找出所有的路径，我们需要一种随着本层递归结束就弹出加入元素的数据结构，满足后进先出的数据结构就是栈，此处非常巧妙，应该多练习这个题目，能对栈这种数据结构带来的神奇效应有更好的理解。
> 输入为: 二叉树树根和待求整数
>
    public void finPath(TreeNode root, int sum){
        // 异常处理
        if(root == null){
            return;
        }
        // 声明一个栈可以保存目前已经入栈的元素，一旦一个递归结束了，可以弹出
        Stack<Integer> stack = new Stack<Integer>(); // 注意多态只使用与引用类型
        int currentSum = 0;
        findPath(root, stack, sum, currentSum);
    }

    // 用来递归的函数
    public void findPath(TreeNode root, Stack<Integer> stack, int sum， int currentSum){
        // 终止条件，到达叶子节点
        stack.push(root.val); // 将当前节点值入栈
        currentSum += root.val; // 计算当前和
        // 到达叶子节点并且和为sum时，输出
        // 若将sum那个条件去掉，就是获得所有的路径
        if(root.left == null && root.right == null && currentSum == sum){
            for(int i: stack){
                System.out.println(i+ " ");
            }
        }
        // 左子树不为空，则递归左子树
        if(root.left!=null){
            findPath(root.left, stack, sum, currentSum);
        }
        // 右子树不为空，则
        if(root.right!=null){
            findPath(root.right, stack, sum, currentSum);
        }
        // 结束本层递归时时，将该节点弹栈，恢复原样
        stack.pop();
    }

## 求二叉树中两个节点的最长距离
> 这是一个最优化问题，类似的问题其实可以是二叉树的最大深度的扩展，对于最大深度一个值，只需要对左右子树进行递归，取左子树和右子树的较大值 + 1，但是现在的问题不仅仅需要最大深度，还需要最长距离，所有新建一个类包含深度和长度来作为结果，作为递归的返回。
> 而两个节点的最长距离无非就三种情况(分情况讨论)
* 左子树的深度 + 右子树的深度(如果设根节点的深度为1，那么子树的深度恰好可以看成根节点到最深叶子的路径长度)
* 左子树的最长距离
* 右子树的最长距离
> 根据分的情况进行递归

> 最简单的思路，就是使用maxDepth的函数，每个节点都求一次深度，但这样做的复杂度就是O(N*log(N))
>
    // 求最大距离，单个节点的最长距离肯定为0
    public int maxDistance(TreeNode root){
        // 异常情况与终止条件
        if(root == null){
            return 0;
        }
        TreeNode left = root.left;
        TreeNode right = root.right;
        return max(max(maxDistance(left), maxDistance(right)), maxDepth(left) + maxDepth(right))
    }

> 如果引入数据结构，将深度保存下来，便可以在递归的时候就计算子树的深度，max(left.depth， right.depth) + 1
> 
    public class Result{
        int maxDepth;
        int maxDistance;
        // 最大深度存储下来
        public Result(int depth, int distance){
            this.maxDepth = depth;
            this.maxDistance = distance; 
        }
    }


> 改进后的算法
>
    public int maxDistance(TreeNode root){
        // 返回根节点
        return findMaxDistance(root).maxDistance;
    }
    // 本质上是最大深度的变形 
    public Result findMaxDistance(TreeNode root){
        // 终止条件
        if(root == null){
            return new Result(0, 0); // 如果为null节点，那么深度和最大距离都为0
        }
        // 求左右子树的 
        Result left = findMaxDistance(root.left);
        Result right = findMaxDistance(root.right);
        // 求节点的最大深度
        int maxDepth = Math.max(left.maxDepth, right.maxDepth) + 1; // 求最大深度
        // 求节点的最大距离
        int maxDistance = Math.max(Math.max(left.maxDistance, right.maxDistance), left.maxDepth + right.maxDepth);
        // 返回结果
        return new Result(maxDepth, maxDistance);
    }

## 利用给定数组构造二叉树
> 已知量是数组int[]，未知量是二叉树，条件是满足二叉树条件
> 想一想，二叉树有什么特点，是不是遇到过类似的问题，想一想，联系二叉树和数组的二叉树有哪些？这个最容易想到的是完全二叉树，因为按层次排列，形成的都是连续的，和数组一一对应，所以不妨构造一个完全二叉树，将二叉树转化为完全二叉树
> 观察未知量：完全二叉树的特点，如果一个节点的序号为x，那么子节点的序号为2*x+1和2*x+2，如果设根节点的序号为0，那么左节点必然为奇数，右节点为偶数，所以设总共有n个节点时，最后一个节点的序号值为n-1
* 2 * x + 1 = n - 1 // 左节点, n为偶数
* 2 * x + 2 = n - 1 // 右节点, n为奇数
=> n为偶数时 x = (n-2) / 2 => x = n/2 - 1
=> n为奇数是 x = (n - 3) / 2 => x = (n-1) / 2 - 1
由下取整的定义即可至 => x = ceiling(n/2) - 1, 即最后一个父节点的索引为 ceiling(n/2) -1
> 由完全二叉树的定义，可知，除了最后一个父节点，其余父节点均带两个子节点，故我们只需要将父节点全部套上子节点即可
> 返回根节点
>
    public TreeNode createTree(int[] value){
        int n = value.length;
        // 异常情况
        if(n == 0){
            return null;
        }
        if(n == 1){
            return new TreeNode(value[0]); // 返回当前节点
        }
        ArrayList<TreeNode> nodeList = new ArrayList<>(); 
        // 将每个值变成节点
        for(int i =0; i <n; i++){
            nodeList.add(value[i]);
        }
        int lastParentIndex = n /2 -1;
        // 遍历父节点，最后一个父节点除外，因为可能包含一个或两个
        for(int i = 0; i < lastParentIndex; i++){
            TreeNode parent = nodeList.get(i); // 获取第i个节点
            parent.left =  new TreeNode(value[2*i + 1]);
            parent.right = new TreeNode(value[2*i + 2]);
        }
        // 最后一个节点，需要判断有几个子节点
        nodeList.get(lastParentIndex).left = new TreeNode(value[2*lastParentIndex + 1]);
        if( 2*lastParentIndex + 2 == n -1){
            nodeList.get(lastParentIndex).right = new TreeNode(value[n-1]);
        }
        return nodeList.get(0);
    }


## 构造一个二叉查找树
> 已知量为数组，未知量为二叉查找树
> 构造二叉查找树就是不点构造二叉树本质上来说就是不断插入，即不断调用二叉树的插入过程,
    public TreeNode createBinaryTree(int[] value){
        int len = value.length;
        if(len == 0){
            return null;
        }
        TreeNode root = new TreeNode(value[0]);
        for(int i = 1; i < len; i++){
            insertTree(root, new TreeNode(value[i]));
        }
        return root;
    }

## 给定n，求1，2， 3， ..., n组成的二叉查找树的数目
> 利用动态规划的思想进行



## 求二叉查找树的第k大的元素
> 已知量：root, k
> 未知量：第k大的元素
> 假设该节点有多少个数，那么便可知第k大的在哪个位置
> 
   TreeNode KthNode(TreeNode root, int k){
        // 异常情况
        if(root == null || k < 1){
            return null;
        }
        // 用以存储还需要遍历多少个点
        int[] item = {k}; 
        // 利用中序遍历
        return inOrder(root, item);
    }
    // 中序遍历递归
    // 返回第k大的结果，以null和非null区分
    TreeNode inOrder(TreeNode root, int[] item){
        TreeNode result = null;
        // 递归左子树，是否有结果
        if(result == null && root.left != null){
            result = inOrder(root.left, item); 
        }
        // 访问该节点
        // 每访问一个，将需要访问的节点-1
        if(result == null){
            // 还需要遍历1个节点
            if(item[0] == 1){
                result = root;
            }
            // 
            else{
                item[0]--;
            }
        }
        // 递归右子树
        if(result == null && root.right!=null){
            result = inOrder(root.right, k);
        }
        return result;
    }

## 深度遍历递归形式
### 前序遍历
public ArrayList<Integer> preOrder(TreeNode root){
    // init
    ArrayList<Integer> result = new ArrayList<Integer>();
    Stack<TreeNode> s = new Stack<>();
    // as
    if(root == null){
        return result;
    }
    // 遍历
    while(root!=null || !s.isEmpty()){
        // 访问当前节点，遍历左子树，将左子树入栈
        while(root!=null){
            result.add(root.val);
            s.push(root); // 入栈
            root = root.left;
        }
        // 左子树遍历结束至null，开始弹栈，遍历其右子树
        if(!s.isEmpty()){
            TreeNode root = s.pop();
            root = root.right; 
        }
    }
    return result;
}
    
### 中序遍历
public ArrayList<Integer> inOrder(TreeNode root){
    // init
    ArrayList<Integer> result = new ArrayList<Integer>();
    Stack<TreeNode> s= new Stack<>();
    // as
    if(root==null){
        return result;
    }
    // root 为空，而且栈内元素已经全部弹出完毕
    while(root!=null || !s.isEmpty()){
        // 遍历左子树
        while(root!=null){
            s.push(root);
            root = root.left;
        }
        // 访问当前节点和右子树
        if(!s.isEmpty()){
            root = s.pop(); // 弹栈，弹出一个即加入一个即可
            result.add(root.val); // 访问当前节点
            root = root.right; 
        }
    }
}

### 后序遍历
> 后序遍历，遍历的结构为左子树，右子树，当前节点;
> 比较的复杂的逻辑点在于，对于每个节点，出栈是为了访问右子树还是访问本身，这是需要添加逻辑判断
> 构造一个新类，增加一个属性，是否第一次访问
class BtNode{
    TreeNode root;
    boolean firstVisit = true;
    public BtNode(root){
        this.root = root;
    }
}

// 后序遍历
public ArrayList<Integer> postorderTraversal(TreeNode root) {
    // as
    if(root==null){
        return result;
    }
    // init
    ArrayList<Integer> result = new ArrayList<Integer>();
    Stack<BtNode> s = new Stack<>();
    
    // traverse
    // end codndition
    while(root!=null || !s.isEmpty()){
        // 遍历左子树
        while(root!=null){
            s.push(new BtNode(root));
            root = root.left;
        }
        // 遍历右子树
        if(!s.isEmpty()){
            // 弹栈的时候
            BtNode bRoot = s.pop();
            root = bRoot.root;
            if(bRoot.firstVisit){
                bRoot.firstVisit = false; // 更新第一次访问
                s.push(bRoot); // 放回，然后遍历右子树
                root = root.right;
            }
            else{
                result.add(root.val); // 访问当前节点
                root = null; // 进入下一次弹栈
            }
        }
    }
    return result;
}


