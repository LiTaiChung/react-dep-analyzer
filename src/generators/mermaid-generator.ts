import { ComponentUsage } from '../types';

interface NodeInfo {
  id: string;
  label: string;
  type: 'component' | 'element' | 'page' | 'other';
}

export function generateMermaidFlowchart(
  targetUsage: Record<string, ComponentUsage>,
  _nodes: Set<string> = new Set<string>(),
  _edges: Set<string> = new Set<string>(),
  initialComponent?: { name: string; data: ComponentUsage }
): string {
  const nodeMap = new Map<string, NodeInfo>();
  const edgeSet = new Set<string>();
  const classAssignments = new Map<string, string>();

  // 收集所有節點和邊的信息
  const processComponent = (componentName: string, data: ComponentUsage) => {
    const sourceId = componentName.replace(/[^a-zA-Z0-9]/g, '_');
    
    // 添加源節點
    if (!nodeMap.has(sourceId)) {
      nodeMap.set(sourceId, {
        id: sourceId,
        label: componentName,
        type: 'component'
      });
      classAssignments.set(sourceId, 'component');
    }

    // 處理依賴節點
    data.dependencies.forEach((dep) => {
      dep.imports.forEach((importName) => {
        const cleanImportName = importName.split(' as ')[0].trim();
        if (cleanImportName !== 'type' && cleanImportName !== componentName) {
          const targetId = cleanImportName.replace(/[^a-zA-Z0-9]/g, '_');
          
          // 添加目標節點
          if (!nodeMap.has(targetId)) {
            let nodeType: 'component' | 'element' | 'other' = 'other';
            if (dep.path.includes('/components/')) {
              nodeType = 'component';
            } else if (dep.path.includes('/elements/')) {
              nodeType = 'element';
            }
            
            nodeMap.set(targetId, {
              id: targetId,
              label: cleanImportName,
              type: nodeType
            });
            classAssignments.set(targetId, nodeType);
          }
          
          // 添加邊
          const edgeKey = `${sourceId}-->${targetId}`;
          edgeSet.add(edgeKey);
        }
      });
    });

    // 處理頁面節點
    data.usedInPages.forEach((page: string) => {
      const pageName = page.replace(/^src\/pages\//, '').replace(/\.tsx$/, '');
      const pageNodeId = `page_${pageName.replace(/[^a-zA-Z0-9]/g, '_')}`;
      
      // 添加頁面節點
      if (!nodeMap.has(pageNodeId)) {
        nodeMap.set(pageNodeId, {
          id: pageNodeId,
          label: `Page_${pageName}`,
          type: 'page'
        });
        classAssignments.set(pageNodeId, 'page');
      }
      
      // 添加邊（從頁面到元件）
      const edgeKey = `${pageNodeId}-->${sourceId}`;
      edgeSet.add(edgeKey);
    });
  };

  // 處理元件
  if (initialComponent) {
    processComponent(initialComponent.name, initialComponent.data);
  } else {
    Object.entries(targetUsage).forEach(([componentName, data]) => {
      processComponent(componentName, data);
    });
  }

  // 生成 Mermaid 代碼
  let output = '```mermaid\ngraph TD\n';

  // 先添加所有節點
  Array.from(nodeMap.values())
    .sort((a, b) => {
      const typeOrder = { page: 0, component: 1, element: 2, other: 3 };
      return typeOrder[a.type] - typeOrder[b.type] || a.label.localeCompare(b.label);
    })
    .forEach(node => {
      output += `    ${node.id}[${node.label}]\n`;
    });

  // 添加連接關係
  Array.from(edgeSet).sort().forEach(edge => {
    output += `    ${edge}\n`;
  });

  output += '\n    %% 樣式定義\n';
  output += '    classDef component fill:#e1f5fe,stroke:#01579b,stroke-width:2px\n';
  output += '    classDef element fill:#f3e5f5,stroke:#4a148c,stroke-width:2px\n';
  output += '    classDef page fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px\n';
  output += '    classDef other fill:#fff3e0,stroke:#e65100,stroke-width:1px\n';

  output += '\n    %% 樣式應用\n';
  Array.from(classAssignments.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([nodeId, className]) => {
      output += `    class ${nodeId} ${className}\n`;
    });

  output += '```\n\n';
  
  // 添加簡化版本以提高兼容性
  output += '## 簡化版本 (如果上面的圖表無法顯示)\n\n';
  output += '```mermaid\ngraph LR\n';
  
  // 簡化的節點和連接
  Array.from(nodeMap.values())
    .filter(node => node.type !== 'page') // 只顯示元件和元素
    .forEach(node => {
      output += `    ${node.id}[${node.label}]\n`;
    });
    
  Array.from(edgeSet)
    .filter(edge => !edge.includes('page_')) // 過濾掉頁面連接
    .forEach(edge => {
      output += `    ${edge}\n`;
    });
    
  output += '```\n';
  
  return output;
}