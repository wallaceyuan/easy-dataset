import { NextResponse } from 'next/server';
import { NextAPI } from '@/service/middleware/entry';
import { MongoModel } from '@dataset/service/core/models/schema'
import { MongoProject } from '@dataset/service/core/projects/schema'

// 获取模型配置
export async function GET(request, { params }) {
  return NextAPI(handler)(request, params)
}

async function handler(_, params) {

  try {
    const { projectId } = params;

    // 验证项目 ID
    if (!projectId) {
      throw { error: '项目 ID 不能为空', status: 500 }
    }

    // 检查项目是否存在
    const existingTask = await MongoProject.findOne({ projectId });
    if(!existingTask){
      throw { error: '项目不存在', status: 500 }
    }

    const modelConfig = await MongoModel.find({ projectId })

    return modelConfig || []

  } catch (error) {
    console.error('获取模型配置出错:', error);
    throw { error: '获取模型配置失败', status: 500 }
  }
}

// 更新模型配置
export async function POST(request, { params }) {
  return NextAPI(handlerPOST)(request, params)
}


async function handlerPOST(request, params) {

  try {
    const { projectId } = params;

    // 验证项目 ID
    if (!projectId) {
      throw { error: '项目 ID 不能为空', status: 500 }
    }

    // 获取请求体
    const modelConfig = await request.json();

    const newTask = new MongoModel({
      projectId,
      ...modelConfig
    })

    const savedTask = await newTask.save();

    return savedTask

  } catch (error) {
    console.error('更新模型配置出错:', error);
    return NextResponse.json({ error: '更新模型配置失败' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  return NextAPI(handlerPUT)(request, params)
}


async function handlerPUT(request, params) {

  try {
    const { projectId } = params;

    // 验证项目 ID
    if (!projectId) {
      throw { error: '项目 ID 不能为空', status: 500 }
    }

    // 获取请求体
    const modelConfig = await request.json();

    const task = await MongoModel.findOneAndUpdate(
      { projectId, _id: modelConfig._id },
      { $set: modelConfig },
      { new: true } // 返回更新后的文档
    );

    return task;

  } catch (error) {
    console.error('更新模型配置出错:', error);
    return NextResponse.json({ error: '更新模型配置失败' }, { status: 500 });
  }
}