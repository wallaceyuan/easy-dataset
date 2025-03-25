import { NextResponse } from 'next/server';
import { NextAPI } from '@/service/middleware/entry';
import { DEFAULT_SETTINGS } from '@/constant/setting';

import { MongoTask } from '@dataset/service/core/tasks/schema'
import { MongoProject } from '@dataset/service/core/projects/schema'

// 获取任务配置
export async function GET(request, { params }) {
  return NextAPI(handler)(request, params)
}


async function handler(_, params) {

  try {
    const { projectId } = params;

    // 验证项目 ID
    if (!projectId) {
      return NextResponse.json({ error: '项目 ID 不能为空' }, { status: 400 });
    }

    const taskConfig = await MongoTask.findOne({ projectId });

    if (!taskConfig) {
      console.log(`No tasks found for projectId: ${projectId}`);
      return DEFAULT_SETTINGS;
    }else{
      return taskConfig
    }

  } catch (error) {
    console.error('获取任务配置出错:', error);
    throw new Error(JSON.stringify({ error: '获取任务配置失败', status: 500 }));
  }
}


// 更新任务配置
export async function PUT(request, { params }) {
  return NextAPI(handlerPUT)(request, params)
}

async function handlerPUT(request, params) {
  try {
    const { projectId } = params;

    // 验证项目 ID
    if (!projectId) {
      throw { error: '项目 ID 不能为空', status: 400 }
    }

    // 获取请求体
    const taskConfig = await request.json();

    // 验证请求体
    if (!taskConfig) {
      throw { error: '任务配置不能为空', status: 400 };
    }

    try {
      const project = await MongoProject.findOne({ id: projectId });
      if (!project) {
        throw { error: '项目不存在', status: 500 }
      }
    } catch (error) {
      throw { error: 'Error fetching project:', error, status: 500 }
    }

    try {
      // 2. 检查 tasks 表中是否存在该 projectId 的记录
      const existingTask = await MongoTask.findOne({ projectId });

      if (existingTask) {
        // 如果存在，则更新记录
        const updatedTask = await MongoTask.findOneAndUpdate(
          { projectId },
          { $set: taskConfig },
          { new: true } // 返回更新后的文档
        );
        return { message: '任务配置已更新' }
      } else {
        // 如果不存在，则创建一条新记录
        const newTask = new MongoTask({
          projectId,
          ...taskConfig,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        const savedTask = await newTask.save();
        return { message: '任务配置已更新' };
      }
 
    } catch (error) {
      throw { error: error, status: 500 }
    }
  } catch (error) {
    throw { error: '更新任务配置失败', status: 500 };
  }
}