# 什么是DBSCAN
DBSCAN是一种常用的密度聚类算法, 算法的输入参数为minPts, r
由于其思想朴素，在二维空间的聚类上具有很好的效果，所以非常常用
## 基本概念
> r邻域: 对任意一点p, 其r领域定义为 N(p) = {q属于数据集|dist(p, q) <= r}
> 密度: 设x属于数据集，那么x的密度 p(x) = |N(x)|;
> 核心点: 如果点x密度 > minPts,则称该点为核心点
> 边界点: x不是核心点，但是落在了核心点的r领域里
> 直接密度可达: 如果x1位于x2的r领域内，且x2为核心点，那么x1与x2直接密度可达
> 密度可达: 假设存在一串点p_{1},p_{2},...,p{n},p_{1}=q,p_{n}=p，使得p_{i+1}从p_{i}是直接密度可达的，那么就认为p从q密度可达。
> 密度相连: 假设存在点o,p,q，其中p,q均从o密度可达，那么p和q密度相连。密度相连具有对称性。
> 类簇:
设非空集合C\subset X，若满足：\forall p,q，
（1）p\in C，且q从p密度可达，那么q\in C。
（2）p和q密度相连。
则称C构成一个类簇
# 为什么使用DBSCAN
因为算法比较朴素，运算比较高效
需要更少的领域知识来确定输入参数；发现任意形状的聚簇；在大规模数据库上更好的效率。DBSCAN能够将足够高密度的区域划分成簇，并能在具有噪声的空间数据库中发现任意形状的簇。

# DBSCAN 算法
DBSCAN的核心思想是从某个核心点出发，不断向密度可达的区域扩张，从而得到一个包含核心点和边界点的最大化区域，区域中任意两点密度相连。
> 伪代码如下
// D是数据集
// eps是领域半径
// Minpts是核心点最小
DBSCAN(D, eps, MinPts) {
   C = 0
   for each point P in dataset D {
      if P is visited
         continue next point
      mark P as visited
      NeighborPts = regionQuery(P, eps)
      if sizeof(NeighborPts) < MinPts
         mark P as NOISE
      else {
         // 新建一个类号
         C = next cluster
         expandCluster(P, NeighborPts, C, eps, MinPts)
      }
   }
}

// 扩张该核心点
expandCluster(P, NeighborPts, C, eps, MinPts) {
   add P to cluster C
   for each point P' in NeighborPts { 
      if P' is not visited {
         mark P' as visited
         NeighborPts' = regionQuery(P', eps)
         if sizeof(NeighborPts') >= MinPts
            NeighborPts = NeighborPts joined with NeighborPts'
      }
      // 既不是核心点又不属于其他类
      if P' is not yet member of any cluster
         add P' to cluster C
   }
}

// 查询
regionQuery(P, eps)
   return all points within P's eps-neighborhood (including P)

## 优点与不足
### 优点
1. 相比 k-means算法，DBSCAN 不需要预先声明聚类数量。
2. DBSCAN 可以找出任何形状的聚类，甚至能找出一个聚类，它包围但不连接另一个聚类，另外，由于 MinPts 参数，single-link effect （不同聚类以一点或极幼的线相连而被当成一个聚类）能有效地被避免。
3. DBSCAN 能分辨噪音（局外点）。(重要)
4. DBSCAN 只需两个参数，且对数据库内的点的次序几乎不敏感（两个聚类之间边缘的点有机会受次序的影响被分到不同的聚类，另外聚类的次序会受点的次序的影响）。
5. DBSCAN 被设计成能配合可加速范围访问的数据库结构，例如 R*树。
6. 如果对资料有足够的了解，可以选择适当的参数以获得最佳的分类。
### 不足
1. DBSCAN不是完全决定性，两个类的边界点的分类，可能取决于点的次序，然而核心点和噪音点都是完全决定的
2. DBSCAN的r参数的选择受度量方式的影响，最常用的是欧几里得距离，在高维数据中很难找到一个合适的r
3. 如果数据的密度分布很不均匀，那么统一的r, minPts并不适合所有的聚类
4. r的选取取决于你对数据和资料的理解