import { deleteProject } from '@/lib/db/index';
import { MongoProject } from '@dataset/service/core/projects/schema'
import { NextAPI } from '@/service/middleware/entry';


// 获取项目详情
export async function GET(request, { params }) {
  return NextAPI(handler)(request, params)
}

async function handler(_, params) {
  try {
    const projectId = params.projectId;
    const taskConfig = await MongoProject.findOne({ projectId });
    return taskConfig;
  } catch (error) {
    console.error('获取项目详情出错:', error);
    throw { error: error.message, status: 500 };
  }
}


// 更新项目
export async function PUT(request, { params }) {
  return NextAPI(handlerPUT)(request, params)
}

async function handlerPUT(request, params) {
  try {
    const projectId = params.projectId;
    const newConfig = await request.json();

    const existingTask = await MongoProject.findOne({ projectId });

    if(existingTask){
      const config = await MongoProject.findOneAndUpdate(
        { projectId },
        {
          $set: newConfig
        },
        { new: true } // 返回更新后的文档
      );
      return config
    }else{
      throw { error: '配置不存在', status: 500  };
    }
  } catch (error) {
    console.error('更新项目配置失败:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 删除项目
export async function DELETE(request, { params }) {
  try {
    const { projectId } = params;
    const success = await deleteProject(projectId);

    if (!success) {
      return Response.json({ error: '项目不存在' }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('删除项目出错:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
