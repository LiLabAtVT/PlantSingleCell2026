// content.js, guidance for every plot.
// Each plot: file (stem, .png shown + .pdf download), title, purpose, interpret, tip.
const DATASET = {
  title: "Single-cell RNA-seq Visualization Guide",
  subtitle: "Arabidopsis root atlas, CORTEX vs PET111 (Seurat) · 11,463 cells · 21 clusters",
};

const TABS = [
  {
    id: "01_qc", name: "Quality Control",
    intro: "QC removes low-quality barcodes (dying cells, empty droplets, doublets) before any biology. In plants, watch chloroplast and mitochondrial fractions, high values flag broken cells / protoplasting stress.",
    plots: [
      { file: "violin_qc", title: "QC violin plots",
        purpose: "Per-cell distribution of the four QC metrics:<ul>" +
          "<li><code>nFeature</code> = genes per cell</li>" +
          "<li><code>nCount</code> = UMIs (molecules) per cell</li>" +
          "<li><code>percent.mt</code> = % mitochondrial reads</li>" +
          "<li><code>percent.cp</code> = % chloroplast reads (plant)</li></ul>" +
          "Arabidopsis gene IDs:<ul>" +
          "<li>nuclear = <code>AT[1-5]G…</code></li>" +
          "<li>mitochondrial = <code>ATMG…</code> (→ percent.mt)</li>" +
          "<li>chloroplast = <code>ATCG…</code> (→ percent.cp)</li></ul>",
        interpret: "Healthy cells form one broad body.<ul>" +
          "<li>Low tails = empties / dying cells</li>" +
          "<li>High tails = doublets</li>" +
          "<li>High mt / cp = stressed cells</li></ul>",
        tip: "Suggested cut-offs (tune to your violins):<ul>" +
          "<li><code>nFeature</code> &gt; 200 (upper bound at the high tail)</li>" +
          "<li><code>nCount</code> &gt; 500 (upper bound at the high tail)</li>" +
          "<li><code>percent.mt</code> &lt; 5%</li>" +
          "<li><code>percent.cp</code> &lt; 10%</li></ul>" +
          "Upper bound: cut at median + 3×MAD, or drop the top 1–2% of cells; verify on the gene/UMI scatter." },
      { file: "scatter_count_feature", title: "Genes vs UMI counts",
        purpose: "Relationship between how many molecules vs how many genes each cell has:<ul>" +
          "<li><b>X</b> = <code>nCount</code> = molecules (UMIs) per cell</li>" +
          "<li><b>Y</b> = <code>nFeature</code> = genes per cell</li>" +
          "<li>each dot = one cell (colored by sample)</li></ul>",
        interpret: "Real cells form one tight rising curve.<ul>" +
          "<li>Below the band (many UMIs, few genes) = ambient RNA / dying cells</li>" +
          "<li>Above the band (top-right) = doublets</li></ul>",
        tip: "Good cells sit on the band." },
    ],
  },
  {
    id: "02_dimred", name: "Dimensionality Reduction",
    intro: "Thousands of genes are compressed to a few informative dimensions (PCA), then to 2D (UMAP/t-SNE) for visualization. PCA feeds clustering; UMAP/t-SNE are for the eye only.",
    plots: [
      { file: "pca", title: "PCA (PC1 vs PC2)",
        purpose: "Linear projection capturing the largest axes of variation — the input to neighbors/clustering.",
        interpret: "Spread along PC1/PC2 reflects dominant variation.<ul>" +
          "<li>Often cell type, sometimes batch or cell cycle</li>" +
          "<li>Color by sample: if samples split entirely on a PC, that PC encodes batch → integrate</li></ul>",
        tip: "Don't over-interpret raw PCA in 2D — it shows only 2 of ~30 useful dimensions." },
      { file: "elbow", title: "Elbow / variance plot",
        purpose: "Choose how many principal components (PCs) to keep for the neighbor graph.",
        interpret: "Standard deviation per PC drops then flattens.<ul>" +
          "<li>The 'elbow' = where added PCs stop carrying signal</li>" +
          "<li>Keep PCs up to the plateau (here ~30, dashed line)</li></ul>",
        tip: "Too few PCs merges cell types; too many adds noise. When unsure, err slightly high." },
      { file: "umap_clusters", title: "UMAP",
        purpose: "Nonlinear 2D embedding preserving local neighborhoods — the standard scRNA-seq map.",
        interpret: "Each point is a cell; islands are transcriptionally distinct populations.<ul>" +
          "<li>Trust which cells sit together (local structure)</li>" +
          "<li>Distrust absolute distances and gaps between far-apart islands</li></ul>",
        tip: "UMAP is a visualization, not ground truth — never measure 'distance between clusters' off it." },
      { file: "tsne_clusters", title: "t-SNE",
        purpose: "Alternative nonlinear embedding emphasizing tight local clusters.",
        interpret: "Reveals well-separated blobs but exaggerates gaps.<ul>" +
          "<li>Sensitive to perplexity</li>" +
          "<li>Use as a second opinion to UMAP; agreement builds confidence</li></ul>",
        tip: "Cluster sizes and inter-cluster distances in t-SNE are not meaningful." },
    ],
  },
  {
    id: "03_clustering", name: "Clustering",
    intro: "Clustering groups similar cells into putative cell types. Cells are linked to their nearest neighbors, then Leiden (or older Louvain) finds the tightly-connected groups. Resolution sets how fine the groups are. The clusters are computed from this graph, then colored onto the UMAP.",
    plots: [
      { file: "umap_clusters", title: "Clusters on UMAP",
        purpose: "Display the cluster assignment each cell received.",
        interpret: "Compact, well-separated clusters that match marker boundaries are trustworthy.<ul>" +
          "<li>One island fragmented into many clusters = over-clustering</li>" +
          "<li>One cluster spanning two islands = under-clustering</li></ul>",
        tip: "Cross-check every cluster against marker genes before naming it a cell type." },
      { file: "clustree", title: "Clustree",
        purpose: "Track how clusters split and merge as resolution increases.",
        interpret: "Each row is a resolution; arrows show where cells flow.<ul>" +
          "<li>Stable, clean branches = robust clusters</li>" +
          "<li>Many crossing arrows (cells ping-ponging) = unstable resolution</li></ul>",
        tip: "Pick the highest resolution that stays stable, just before arrows start tangling." },
    ],
  },
  {
    id: "04_markers", name: "Marker Genes",
    intro: "Marker genes define cluster identity. These plots show where a gene is expressed and how specifically, the evidence you use to assign cell types.",
    plots: [
      { file: "featureplot", title: "Feature plots",
        purpose: "Overlay a gene's expression on the UMAP, one gene per panel (color = expression).",
        interpret: "Where the color lights up tells you the gene's domain.<ul>" +
          "<li>Marker lighting up exactly one island = confirms that cluster's identity</li>" +
          "<li>Diffuse across all clusters = housekeeping, not a marker</li></ul>",
        tip: "Pair each candidate marker's feature plot with a violin for quantitative confirmation." },
      { file: "violin_markers", title: "Marker violins",
        purpose: "Quantify a marker's expression per cluster.",
        interpret: "A good marker is high in one cluster and near-zero elsewhere.<ul>" +
          "<li>Clean, tall single violin = specific</li>" +
          "<li>Broad expression across clusters = low specificity</li></ul>",
        tip: "Specificity (off in other clusters) matters more than raw height." },
      { file: "dotplot", title: "Dot plot",
        purpose: "Summarize many markers × many clusters compactly:<ul>" +
          "<li>dot color = mean expression</li>" +
          "<li>dot size = % of cells expressing</li></ul>",
        interpret: "The ideal marker is a big, dark dot in its cluster and small/pale elsewhere. The workhorse figure for annotation.",
        tip: "Large but pale dot = expressed widely but weakly; small dark dot = strong in a few cells." },
      { file: "heatmap_markers", title: "Marker heatmap",
        purpose: "Show top markers per cluster across single cells (scaled).",
        interpret: "Look for block structure along the diagonal.<ul>" +
          "<li>Block-diagonal (genes high only within their cluster) = clean, separable identities</li>" +
          "<li>Blurred blocks = similar or merging clusters</li></ul>",
        tip: "Off-diagonal bleed between two clusters suggests they may be one cell type." },
    ],
  },
  {
    id: "05_de", name: "Differential Expression",
    intro: "Differential expression identifies genes whose expression shifts between conditions.",
    plots: [
      { file: "volcano", title: "Volcano plot",
        purpose: "Show fold-change vs significance for every gene at once:<ul>" +
          "<li><b>X</b> = log2 fold-change</li>" +
          "<li><b>Y</b> = −log10 adjusted p</li></ul>",
        interpret: "Where a gene sits tells you both effect and confidence.<ul>" +
          "<li>Top-left / top-right corners = strong, significant hits</li>" +
          "<li>Near x=0 = no change</li>" +
          "<li>Low on Y = not significant regardless of fold-change</li></ul>",
        tip: "Require BOTH a fold-change and a significance cutoff (dashed lines), never one alone." },
      { file: "dotplot_DEGs_ctrl_vs_mej_harmony", title: "DEG dot plot (ctrl vs mej)",
        purpose: "Show the top condition DEGs across every cluster, split by direction:<ul>" +
          "<li>left block = genes up in <b>ctrl</b>, right block = genes up in <b>mej</b></li>" +
          "<li>rows = clusters, doubled into <code>_ctrl</code> and <code>_mej</code> identities</li>" +
          "<li>dot color = mean expression, dot size = % of cells expressing</li></ul>",
        interpret: "Compare the matching <code>_ctrl</code> and <code>_mej</code> rows for each cluster.<ul>" +
          "<li>Up-in-ctrl genes should be bigger/darker on the <code>_ctrl</code> rows, and vice-versa</li>" +
          "<li>A consistent shift across many clusters = a shared condition response</li>" +
          "<li>A shift in only some clusters = a cell-type-specific response</li></ul>",
        tip: "Single-cell DE p-values are inflated — read this as a visual companion to the pseudobulk volcano, not standalone proof.",
        cite: "Miaomiao Li et al., in preparation" },
    ],
  },
  {
    id: "06_trajectory", name: "Trajectory",
    intro: "When cells form a continuum (differentiation), trajectory methods order them along 'pseudotime' and trace lineage branches. Roots in plants are a classic continuous system.",
    cite: "Shaar-Moshe et al., in preparation",
    plots: [
      { file: "trajectory_pseud", title: "Pseudotime along the trajectory",
        purpose: "Cells laid out on the inferred trajectory backbone, colored by pseudotime from the root:<ul>" +
          "<li>color = pseudotime (dark = root, bright = late)</li>" +
          "<li>black line = the fitted trajectory; arrows = direction</li>" +
          "<li>large dots = milestones (waypoints)</li></ul>",
        interpret: "Follow the color along the backbone.<ul>" +
          "<li>Smooth gradient root→tip = a well-ordered progression</li>" +
          "<li>Arrows show the direction of development</li></ul>",
        tip: "Pseudotime is relative ordering, not real time — validate the root and direction with markers." },
      { file: "trajectory_milestone_rootA", title: "Milestone network (root A)",
        purpose: "Same trajectory backbone with labeled milestones A–J; cells colored by milestone segment.",
        interpret: "Milestones are waypoints along the path.<ul>" +
          "<li>A = root, J = end state (per the arrows)</li>" +
          "<li>Linear chain = one continuum; splits = branch decisions</li></ul>",
        tip: "Milestones segment the continuum into stages — line them up against known developmental markers." },
      { file: "heatmap_top100_rootA", title: "Top-100 genes along pseudotime",
        purpose: "Expression of the 100 most trajectory-associated genes, cells ordered by pseudotime (milestones A→J along the bottom):<ul>" +
          "<li>rows = genes (clustered by the dendrogram)</li>" +
          "<li>columns = cells ordered by pseudotime</li>" +
          "<li>red = high, blue = low expression</li></ul>",
        interpret: "Look for diagonal waves of expression.<ul>" +
          "<li>Bands switching on in sequence = an ordered differentiation program</li>" +
          "<li>Row clusters = co-regulated gene modules along the path</li></ul>",
        tip: "Cross-check the top genes against known stage markers to confirm the trajectory's biology." },
      { file: "paga_graph", title: "PAGA-style graph",
        purpose: "Abstract clusters to nodes and connect them by transcriptional connectivity.",
        interpret: "Edges encode whether states connect.<ul>" +
          "<li>Thick edges = clusters with many shared neighbors (likely connected states)</li>" +
          "<li>Absent edges = no transition</li></ul>" +
          "Gives the topology before committing to a single path.",
        tip: "Use PAGA to decide whether a continuous trajectory is even appropriate." },
    ],
  },
  {
    id: "09_pathway", name: "Functional / Pathway",
    intro: "Translate gene lists into biology via GO/pathway enrichment and signature scoring. Uses org.At.tair.db for real Arabidopsis GO terms.",
    plots: [
      { file: "go_enrichment", title: "GO enrichment",
        purpose: "Find biological processes over-represented in a cluster's markers (each dot = a GO term).",
        interpret: "Read each dot's position and size.<ul>" +
          "<li>Position/color = significance</li>" +
          "<li>Size = number of genes</li></ul>" +
          "Top terms suggest the cluster's function (cell wall, photosynthesis, stress response…).",
        tip: "Use a sensible background gene set (expressed genes) or enrichment inflates." },
    ],
  },
  {
    id: "10_integration", name: "Integration",
    intro: "Integration removes technical batch differences so the same cell type from different samples co-clusters, while preserving real biological differences. Here: Harmony.",
    plots: [
      { file: "umap_before", title: "Before integration",
        purpose: "Show the UMAP from raw PCA, colored by sample.",
        interpret: "Check whether samples separate.<ul>" +
          "<li>Samples forming separate islands of the same cell types = batch effect, not biology</li></ul>" +
          "This is the motivation to integrate.",
        tip: "Some separation can be real condition biology; markers tell you which." },
      { file: "umap_after", title: "After integration",
        purpose: "Show the Harmony-corrected UMAP, colored by sample.",
        interpret: "Check whether samples now mix.<ul>" +
          "<li>Samples overlap within shared cell types (well-mixed colors)</li>" +
          "<li>Distinct cell types stay apart</li></ul>" +
          "That is successful integration.",
        tip: "Over-integration erases real differences; check that known distinct populations remain separate." },
      { file: "umap_split", title: "Split UMAP",
        purpose: "Show the shared embedding faceted per sample.",
        interpret: "Compare the two facets.<ul>" +
          "<li>Both panels should occupy the same regions if integration worked</li>" +
          "<li>A cluster present in one panel but empty in the other = a sample-specific population</li></ul>",
        tip: "Best view for spotting genuinely sample-unique cell states." },
      { file: "cells_per_cluster", title: "Cell counts per cluster × sample",
        purpose: "Grouped bars of how many cells each sample contributes to each cluster:<ul>" +
          "<li><b>X</b> = cluster</li>" +
          "<li><b>Y</b> = number of cells</li>" +
          "<li>one bar per sample (CORTEX, PET111)</li></ul>",
        interpret: "Compare the paired bars within each cluster.<ul>" +
          "<li>Similar heights = cluster shared by both samples</li>" +
          "<li>One bar much taller = sample-specific or expanded population</li></ul>",
        tip: "Raw counts, not proportions — tiny clusters (&lt;~20 cells) give noisy downstream tests." },
      { file: "sample_mixing", title: "Sample mixing per cluster",
        purpose: "Quantify how balanced each cluster is across samples.",
        interpret: "Read each bar against the 50/50 line.<ul>" +
          "<li>Near the dashed line = well-mixed (good integration)</li>" +
          "<li>Strongly one-sided = residual batch or true sample-specific biology</li></ul>",
        tip: "Judge mixing per cell type, not globally — rare types can legitimately be one-sided." },
    ],
  },
  {
    id: "11_specialized", name: "Specialized",
    intro: "Advanced and dataset-specific views: co-expression networks/modules, reporter-line validation, and tissue-specific expression comparisons.",
    plots: [
      { file: "grn_network", title: "Co-expression network (GRN)",
        purpose: "Show genes that co-vary across cells as a network (regulatory-module proxy).",
        interpret: "Read nodes and edges.<ul>" +
          "<li>Nodes = genes</li>" +
          "<li>Orange edges = positive co-expression, blue = negative</li>" +
          "<li>Tight clusters of connected genes = candidate co-regulated modules / regulons</li></ul>",
        tip: "For true regulons use SCENIC (TF-target motifs); co-expression alone is correlational." },
      { file: "geneExpression_comparison_CO2", title: "CO2_GFP vs GFP by cell type",
        purpose: "Compare average expression of two reporter lines across root cell types:<ul>" +
          "<li><b>X</b> = cell type</li>" +
          "<li><b>Y</b> = average gene expression</li>" +
          "<li>two lines: CO2_GFP (red), GFP (teal)</li></ul>",
        interpret: "Both lines peak sharply in Cortex.<ul>" +
          "<li>A single cell-type peak = the reporter is tissue-specific (cortex)</li>" +
          "<li>The two lines tracking together = consistent expression between constructs</li></ul>",
        tip: "A clean peak in one cell type confirms the marker's tissue specificity." },
      { file: "ScatterPlot_WER", title: "WER vs WER::GFP correlation",
        purpose: "Correlate native WER expression against the WER::GFP reporter:<ul>" +
          "<li><b>X</b> = WER, <b>Y</b> = WER::GFP</li>" +
          "<li>blue line = linear fit; marginal histograms = each distribution</li></ul>",
        interpret: "Check how tightly the points follow the line.<ul>" +
          "<li>Tight diagonal (correlation = 0.91) = reporter faithfully tracks the native gene</li>" +
          "<li>Slope ~0.25 = reporter is lower-magnitude but proportional</li></ul>",
        tip: "High correlation validates WER::GFP as a proxy for endogenous WER." },
      { file: "hdWGCNA", title: "hdWGCNA module dendrogram",
        purpose: "Group co-expressed genes into modules with hdWGCNA (high-dimensional WGCNA):<ul>" +
          "<li>dendrogram = hierarchical clustering of genes</li>" +
          "<li>color bar = module assignment</li></ul>",
        interpret: "Read the colored blocks under the tree.<ul>" +
          "<li>Each color = a co-expression module (genes that vary together)</li>" +
          "<li>Grey = genes not assigned to any module</li></ul>",
        tip: "Modules are candidate gene programs — correlate module eigengenes with cell types or conditions." },
      { file: "sankey_plot", title: "Sankey plot",
        purpose: "Placeholder description — explains what this Sankey diagram shows.<ul>" +
          "<li>nodes = groups</li>" +
          "<li>ribbons = flow of items between groups</li></ul>",
        interpret: "Placeholder interpretation — how to read the flows.<ul>" +
          "<li>ribbon width = number of items</li>" +
          "<li>follow a ribbon to see where a group maps</li></ul>",
        tip: "Placeholder tip — replace with the real takeaway for this plot." },
    ],
  },
];
