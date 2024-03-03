<script setup lang="ts">
import { computed, ref } from "vue";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
)

class UnitPrice {
    label: string = "会社A"
    base: number = 500
    elecs: { cost: number, lt: number }[] = [{ cost: 28, lt: 120 }, { cost: 60, lt: 240 }]
    fuel: number = 5
    reEnergy: number = 2
}

function* range(begin: number, end: number, interval: number = 1) {
    for (let i = begin; i < end; i += interval) {
        yield i;
    }
}


const plans = ref<UnitPrice[]>([new UnitPrice()])
// 配列変数に格納
// 電気使用料 必ず0からスタート
const usage = computed(() => {
    const maxUsage = plans.value.map((cost) => {
        return cost.elecs[cost.elecs.length - 1].lt
    })
    return [...range(0, Math.max(...maxUsage), 2)]
})


// 各段階における料金の計算式
const eachStageFuncs = computed<Function[][]>(() => {
    const graphs: Function[][] = []
    for (let cost of plans.value) {
        const funcs: Function[] = []
        const _c = cost
        // ベースとなる最初の式
        const f0 = (x: number) => { return (_c.fuel + _c.reEnergy + _c.elecs[0].cost) * x + _c.base }
        funcs.push(f0)
        for (let i = 1; i < _c.elecs.length; i++) {
            // Fn = a(x - thodhhold) + F{n-1}
            const fi = (x: number) => {
                return (_c.fuel + _c.reEnergy + _c.elecs[i].cost) * (x - _c.elecs[i - 1].lt) + funcs[i - 1](_c.elecs[i - 1].lt)
            }
            funcs.push(fi)
        }
        graphs.push(funcs)
    }
    return graphs
})

const prices = computed<number[][]>(() => {
    const _prices: number[][] = []
    for (let i = 0; i < plans.value.length; i++) {
        const cost = plans.value[i]
        const price = usage.value.map(x => {
            // 電気使用料の最大値の小さい順でループ
            for (let j = 0; j < cost.elecs.length; j++) {
                // xの値が電気料金の範囲内のに最初に入った時にforを抜ける
                if (x <= cost.elecs[j].lt) {
                    return eachStageFuncs.value[i][j](x)
                }
            }
        })
        _prices.push(price)
    }
    return _prices
})

const options = {
    responsive: false,
    maintainAspectRatio: false
}

const chartData = computed(() => {
    const datasets = []
    for (let i = 0; i < plans.value.length; i++) {
        datasets.push({
            label: plans.value[i].label,
            backgroundColor: '#f87979',
            data: prices.value[i]
        })
    }
    return {
        labels: usage.value,
        datasets: datasets
    }
})

</script>

<template>
    <div>
        <table v-for="cost in plans" :key="cost.label">
            <thead>
                <tr>
                    <th scope="col">Person</th>
                    <th scope="col">Most interest in</th>
                </tr>
            </thead>

            <tbody>
                <tr>
                    <th scope="row"><label for="base">基本料金</label></th>
                    <td><input v-model="cost.base" id="base" type="number" /></td>
                </tr>
                <tr v-for="_, i in cost.elecs" :key="i">
                    <th scope="row"><label for="ele-cost">電気料金{{ i + 1 }}段階目<input
                                v-model="cost.elecs[i].lt" />まで</label></th>
                    <td><input v-model="cost.elecs[i].cost" id="elec-cost" type="number" /></td>
                </tr>
                <tr>
                    <th scope="row"><label for="fuel-cost">燃料費等調節額</label></th>
                    <td><input v-model="cost.fuel" id="fuel-cost" type="number" /></td>
                </tr>
                <tr>
                    <th scope="row"><label for="re-energy">再エネ発電促進賦課金</label></th>
                    <td><input v-model="cost.reEnergy" id="re-energy" type="number" /></td>
                </tr>
            </tbody>
        </table>
        <Line :data="chartData" :options="options" />
    </div>
</template>

<style>
table {
    border-collapse: collapse;
    border: 2px solid rgb(140 140 140);
    font-family: sans-serif;
    font-size: 0.8rem;
    letter-spacing: 1px;
}

caption {
    caption-side: bottom;
    padding: 10px;
    font-weight: bold;
}

thead,
tfoot {
    background-color: rgb(228 240 245);
}

th,
td {
    border: 1px solid rgb(160 160 160);
    padding: 8px 10px;
}

td:last-of-type {
    text-align: center;
}
</style>
