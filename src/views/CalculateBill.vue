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
    base: number = 90
    elecs: { cost: number, bg: number }[] = [{ cost: 10, bg: 0 }, { cost: 0, bg: 120 }]
    fuel: number = 0
    reEnergy: number = 0
}

function* range(begin: number, end: number, interval: number = 1) {
    for (let i = begin; i < end; i += interval) {
        yield i;
    }
}


// 配列変数に格納
var usage: number[] = [...range(0, 150, 5)]

const cost = ref<UnitPrice>(new UnitPrice())

const price = computed<number[]>(() => {
    const _c = cost.value
    return usage.map(x => {
        let tmp = _c.base + (_c.fuel + _c.reEnergy) * x
        
        for (let i = 0; i < _c.elecs.length - 1; i++) {
            if (_c.elecs[i].bg <= x && x < _c.elecs[i + 1].bg) {
                tmp += _c.elecs[i].cost * x
            }
        }
        
        if (_c.elecs[_c.elecs.length-1].bg <= x) {
            tmp += _c.elecs[_c.elecs.length-1].cost * x
        }
        
        return tmp
    })
})

const data = {
    labels: usage,
    datasets: [
        {
            label: 'Data One',
            backgroundColor: '#f87979',
            data: price.value
        }
    ]
}

const options = {
    responsive: false,
    maintainAspectRatio: false
}

const chartData = computed(() => {
    return {
        labels: usage,
        datasets: [
            {
                label: 'Data One',
                backgroundColor: '#f87979',
                data: price.value
            }
        ]
    }
})

</script>

<template>
    <div>
        <table>
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
                                v-model="cost.elecs[i].bg" />以上</label></th>
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
